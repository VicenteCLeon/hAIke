// src/lib/wikiexplora/index.ts
// Cliente de Wikiexplora, la wiki chilena de montañismo.
//
// hAIke NO mide senderos: lee los datos que la fuente ya declara (distancia,
// desnivel, duración, dificultad) en la plantilla {{RutaForm2}} de cada ficha.
// Se usa la API oficial de MediaWiki, no scraping de HTML.
//
// Uso responsable: User-Agent identificable, caché de 24h (el contenido de una
// wiki cambia poco) y atribución con enlace a la ficha original en la UI.

import type { Route, RouteSummary, Coordinates } from '@/types'

const API_URL = 'https://www.wikiexplora.com/api.php'
const USER_AGENT = 'hAIke/1.0 (proyecto academico de planificacion de trekking)'
/** El contenido de la wiki cambia poco: cachear un día evita golpear la fuente. */
const CACHE_SECONDS = 86400
export const SOURCE_NAME = 'Wikiexplora'

async function wikiRequest(params: Record<string, string>): Promise<Record<string, unknown>> {
  const query = new URLSearchParams({ ...params, format: 'json' })
  const res = await fetch(`${API_URL}?${query}`, {
    headers: { 'User-Agent': USER_AGENT },
    next: { revalidate: CACHE_SECONDS },
  })
  if (!res.ok) throw new Error(`Wikiexplora respondió ${res.status}`)
  return res.json()
}

/** Título → id de URL y viceversa (los títulos llevan espacios y tildes). */
export const toRouteId = (title: string) => encodeURIComponent(title.replace(/ /g, '_'))
export const fromRouteId = (id: string) => decodeURIComponent(id).replace(/_/g, ' ')

const pageUrl = (title: string) => `https://www.wikiexplora.com/${encodeURIComponent(title.replace(/ /g, '_'))}`

/** Extrae el bloque {{Nombre ...}} completo, respetando plantillas anidadas. */
function extractTemplate(wikitext: string, name: string): string | null {
  const start = wikitext.indexOf(`{{${name}`)
  if (start === -1) return null

  let depth = 0
  for (let i = start; i < wikitext.length - 1; i++) {
    const two = wikitext.slice(i, i + 2)
    if (two === '{{') {
      depth++
      i++
    } else if (two === '}}') {
      depth--
      i++
      if (depth === 0) return wikitext.slice(start, i + 1)
    }
  }
  return null
}

/**
 * Divide los parámetros de una plantilla en pares clave/valor.
 * Ignora los `|` que están dentro de plantillas o enlaces anidados
 * (p. ej. `ComentariosMapa = {{Leyenda mapa|x}}` o `[[User:Jupa|Juan]]`).
 */
function parseTemplateParams(template: string): Record<string, string> {
  const body = template.slice(2, -2)
  const parts: string[] = []
  let depth = 0
  let current = ''

  for (let i = 0; i < body.length; i++) {
    const two = body.slice(i, i + 2)
    if (two === '{{' || two === '[[') {
      depth++
      current += two
      i++
    } else if (two === '}}' || two === ']]') {
      depth--
      current += two
      i++
    } else if (body[i] === '|' && depth === 0) {
      parts.push(current)
      current = ''
    } else {
      current += body[i]
    }
  }
  parts.push(current)

  const params: Record<string, string> = {}
  // parts[0] es el nombre de la plantilla, no un parámetro.
  for (const part of parts.slice(1)) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    const key = part.slice(0, eq).trim()
    const value = part.slice(eq + 1).trim()
    if (key && value) params[key] = value
  }
  return params
}

/** Convierte un valor declarado a número, tolerando separadores de miles. */
function num(raw: string | undefined): number | undefined {
  if (!raw) return undefined
  const cleaned = raw.replace(/\.(?=\d{3}\b)/g, '').replace(',', '.').replace(/[^\d.-]/g, '')
  const value = parseFloat(cleaned)
  return Number.isFinite(value) ? value : undefined
}

/** Quita marcado wiki de un valor de texto ([[enlace|texto]], '''negrita'''). */
function clean(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  const text = raw
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1')
    .replace(/'{2,}/g, '')
    .replace(/<[^>]+>/g, '')
    .trim()
  return text || undefined
}

function coord(lat: string | undefined, lon: string | undefined): Coordinates | undefined {
  const la = num(lat)
  const lo = num(lon)
  return la !== undefined && lo !== undefined ? { lat: la, lon: lo } : undefined
}

/**
 * Tildes que los usuarios suelen omitir al escribir topónimos chilenos.
 *
 * La búsqueda de MediaWiki es sensible a acentos: "volcan villarrica" no
 * devuelve nada, "volcán villarrica" sí. Se prueban ambas variantes.
 */
const ACCENTED: Record<string, string> = {
  volcan: 'volcán', cajon: 'cajón', rio: 'río', canon: 'cañón', penon: 'peñón',
  banos: 'baños', olmue: 'olmué', pucon: 'pucón', curico: 'curicó', copiapo: 'copiapó',
  chiloe: 'chiloé', chillan: 'chillán', concepcion: 'concepción', valparaiso: 'valparaíso',
  aysen: 'aysén', nuble: 'ñuble', maipu: 'maipú', cochamo: 'cochamó', quilpue: 'quilpué',
  vicuna: 'vicuña', canete: 'cañete', penalolen: 'peñalolén', jose: 'josé', ramon: 'ramón',
  andres: 'andrés', leon: 'león', nunez: 'núñez', monton: 'montón', atacama: 'atacama',
}

const restoreAccents = (term: string) =>
  term
    .split(' ')
    .map((w) => ACCENTED[w.toLowerCase()] ?? w)
    .join(' ')

/**
 * Variantes de búsqueda, de la más específica a la más general.
 *
 * MediaWiki exige que aparezcan *todos* los términos, así que un calificador de
 * más deja la consulta en cero ("cerro la campana en olmue" → nada, "cerro la
 * campana" → la ficha). Se va recortando por la derecha hasta encontrar algo.
 */
function searchVariants(term: string): string[] {
  const words = term.trim().split(/\s+/).filter(Boolean)
  const variants: string[] = []

  for (let end = words.length; end >= 1; end--) {
    const slice = words.slice(0, end).join(' ')
    if (slice.length < 3) continue
    variants.push(slice)
    const accented = restoreAccents(slice)
    if (accented !== slice) variants.push(accented)
  }

  return [...new Set(variants)]
}

/**
 * Busca rutas probando variantes hasta obtener resultados.
 * Devuelve los de la primera variante que encuentre algo.
 */
export async function findRoutes(term: string, limit = 12): Promise<RouteSummary[]> {
  for (const variant of searchVariants(term)) {
    const results = await searchRoutes(variant, limit)
    if (results.length) {
      if (variant !== term) console.log('[wikiexplora] variante con resultados:', JSON.stringify(variant))
      return results
    }
  }
  return []
}

/** Busca rutas por texto libre (coincidencia exacta de todos los términos). */
export async function searchRoutes(query: string, limit = 12): Promise<RouteSummary[]> {
  const data = (await wikiRequest({
    action: 'query',
    list: 'search',
    srsearch: query,
    srlimit: String(Math.min(limit * 2, 50)),
    srnamespace: '0',
  })) as { query?: { search?: Array<{ title: string; snippet?: string }> } }

  const results = data.query?.search ?? []

  return results
    // Las fichas en inglés duplican la ruta en español.
    .filter((r) => !/\(english\)/i.test(r.title))
    .slice(0, limit)
    .map((r) => ({
      id: toRouteId(r.title),
      name: r.title,
      source: SOURCE_NAME,
      source_url: pageUrl(r.title),
      snippet: r.snippet ? clean(r.snippet.replace(/<[^>]+>/g, '')) : undefined,
    }))
}

/**
 * Lee una ficha y devuelve solo los datos que la fuente declara.
 * Devuelve null si la página no existe o no es una ruta (sin {{RutaForm2}}).
 */
export async function getRoute(title: string): Promise<Route | null> {
  const data = (await wikiRequest({
    action: 'parse',
    page: title,
    prop: 'wikitext',
  })) as { parse?: { wikitext?: { '*'?: string } }; error?: unknown }

  const wikitext = data.parse?.wikitext?.['*']
  if (!wikitext) return null

  const template = extractTemplate(wikitext, 'RutaForm2')
  if (!template) return null

  const p = parseTemplateParams(template)
  const distanceM = num(p['Distancia'])

  return {
    id: toRouteId(title),
    name: title,
    source: SOURCE_NAME,
    source_url: pageUrl(title),
    // La fuente declara la distancia en metros; la UI trabaja en km.
    distance_km: distanceM ? Math.round(distanceM) / 1000 : undefined,
    ascent_m: num(p['MetrosAscenso']),
    descent_m: num(p['MetrosDescenso']),
    summit_m: num(p['Altitud']),
    mean_altitude_m: num(p['AltitudMedia']),
    duration: clean(p['Duracion']),
    technical_difficulty: clean(p['Dificultad Técnica']),
    activity: clean(p['Actividad']),
    trek_type: clean(p['TipoTrek']),
    trail_quality: clean(p['Sendero']),
    signage: clean(p['Señalizacion']),
    infrastructure: clean(p['Infraestructura']),
    scenic_beauty: clean(p['BellezaEscenica']),
    attractions: (clean(p['Atractivos']) ?? '')
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean),
    region: clean(p['VallesStgo']) ?? clean(p['País']),
    nearest_city: clean(p['CiudadesChile']),
    round_trip: clean(p['ComparteIdayRetorno']),
    start: coord(p['Latitud1'], p['Longitud1']),
    end: coord(p['Latitud2'], p['Longitud2']),
    distance_note: clean(p['Comentarios distancia']),
  }
}
