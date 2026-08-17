// src/app/api/plan/route.ts
// Endpoint principal: recibe consulta → devuelve plan completo.
//
// Flujo: la IA extrae el destino → se busca la ruta documentada en Wikiexplora
// → se consulta el clima en sus coordenadas → la IA arma los checklists.
// Ningún dato de la ruta se calcula aquí: todo viene declarado por la fuente.

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { extractDestination, generateTrekPlan, cleanQuery } from '@/lib/ai'
import { findRoutes, getRoute } from '@/lib/wikiexplora'
import { geocodeLocation } from '@/lib/geocoding'
import { getWeatherForecast } from '@/lib/weather'
import type { UserProfile, PlanResponse, Route } from '@/types'

const PlanRequestSchema = z.object({
  query: z.string().min(5, 'La consulta debe tener al menos 5 caracteres'),
  date: z.string().optional(),
  user_profile: z
    .object({
      fitness_level: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
      experience_trekking: z.boolean().default(false),
      group_size: z.number().int().min(1).max(50).optional(),
      has_children: z.boolean().optional(),
    })
    .optional(),
})

/**
 * Busca la primera ruta con ficha estructurada.
 * La búsqueda devuelve páginas por relevancia textual, pero no todas son rutas
 * (hay artículos de zonas, refugios, etc.), así que se recorre hasta encontrar una.
 */
async function firstDocumentedRoute(term: string): Promise<Route | null> {
  const candidates = await findRoutes(term, 6)
  for (const candidate of candidates) {
    const route = await getRoute(candidate.name)
    if (route) return route
  }
  return null
}

/**
 * Intenta varios términos antes de rendirse.
 *
 * La búsqueda de MediaWiki exige que aparezcan todos los términos, así que una
 * extracción de más (o de menos) deja la consulta en cero resultados. Se prueba
 * el destino extraído y, si falla, la consulta original ya depurada.
 */
async function findDocumentedRoute(terms: string[]): Promise<Route | null> {
  const tried = new Set<string>()
  for (const term of terms) {
    const key = term.trim().toLowerCase()
    if (!key || key.length < 3 || tried.has(key)) continue
    tried.add(key)

    const route = await firstDocumentedRoute(term)
    if (route) return route
    console.log('[/api/plan] sin resultados para:', JSON.stringify(term))
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = PlanRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<PlanResponse>(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 },
      )
    }

    const { query, date, user_profile } = parsed.data
    const userProfile: UserProfile = {
      fitness_level: user_profile?.fitness_level ?? 'intermediate',
      experience_trekking: user_profile?.experience_trekking ?? false,
      group_size: user_profile?.group_size,
      has_children: user_profile?.has_children,
    }

    // 1. Extraer el destino del texto libre.
    const destination = await extractDestination(query)
    const searchTerm = destination?.location ?? cleanQuery(query)

    // 2. Buscar la ruta documentada, con la consulta depurada como respaldo.
    const route = await findDocumentedRoute([searchTerm, cleanQuery(query)])
    if (!route) {
      return NextResponse.json<PlanResponse>(
        {
          success: false,
          error: `No encontré una ruta documentada para "${searchTerm}". Prueba con el nombre de un cerro, sendero o parque de Chile.`,
        },
        { status: 404 },
      )
    }

    // 3. Coordenadas: las de la ficha si las declara, si no se geocodifica el nombre.
    let coords = route.start
    if (!coords) {
      // geocodeLocation ya restringe a Chile mediante countrycodes.
      const geo = await geocodeLocation(route.name)
      if (!geo) {
        return NextResponse.json<PlanResponse>(
          { success: false, error: `Encontré "${route.name}" pero no pude ubicarla para consultar el clima.` },
          { status: 422 },
        )
      }
      coords = { lat: geo.lat, lon: geo.lon }
    }

    // 4. Clima para la fecha objetivo.
    const targetDate = destination?.date ?? date ?? new Date().toISOString().split('T')[0]
    const weather = await getWeatherForecast(coords.lat, coords.lon, targetDate)

    // 5. La IA arma los checklists sobre los datos declarados.
    const plan = await generateTrekPlan(route, weather, userProfile, query)

    return NextResponse.json<PlanResponse>({ success: true, plan })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado'
    console.error('[/api/plan]', message)
    return NextResponse.json<PlanResponse>({ success: false, error: friendlyError(message) }, { status: 500 })
  }
}

/**
 * Traduce fallos de infraestructura a algo accionable.
 * El error crudo de Gemini llega como un volcado de JSON que no le dice nada
 * a quien usa la app; el detalle técnico queda en el log del servidor.
 */
function friendlyError(raw: string): string {
  if (/PERMISSION_DENIED|denied access|403/i.test(raw)) {
    return 'El servicio de IA rechazó la petición: la cuenta de Gemini no tiene acceso habilitado. Revisa la GEMINI_API_KEY en .env.local (genera una nueva en aistudio.google.com).'
  }
  if (/API_KEY_INVALID|API key not valid|400/i.test(raw)) {
    return 'La clave de IA no es válida. Genera una nueva en aistudio.google.com y actualiza GEMINI_API_KEY en .env.local.'
  }
  if (/RESOURCE_EXHAUSTED|quota|429/i.test(raw)) {
    return 'Se agotó la cuota del servicio de IA por hoy. Inténtalo más tarde.'
  }
  if (/no está configurada/i.test(raw)) {
    return 'Falta configurar GEMINI_API_KEY en .env.local para generar planes.'
  }
  return raw
}
