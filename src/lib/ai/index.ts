// src/lib/ai/index.ts
// IA usando Google Gemini (gratis con AI Studio key)

import type { Route, WeatherForecast, TrekPlan, UserProfile, ChecklistItem } from '@/types'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? ''
const GEMINI_MODEL   = 'gemini-2.5-flash'
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

// ─── Cliente Gemini ───────────────────────────────────────────
async function chat(system: string, user: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY no está configurada en .env.local')
  }

  const res = await fetch(GEMINI_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: {
        temperature:     0.3,
        maxOutputTokens: 4096,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[Gemini API error]', res.status, err)
    throw new Error(`Gemini error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  console.log('[Gemini response]', text.substring(0, 200))
  return text
}

// Extrae JSON aunque venga envuelto en markdown
function extractJSON(text: string): unknown {
  try { return JSON.parse(text.trim()) } catch {}
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) { try { return JSON.parse(fenced[1].trim()) } catch {} }
  const brace = text.match(/\{[\s\S]*\}/)
  if (brace)  { try { return JSON.parse(brace[0]) } catch {} }
  throw new Error('No se encontró JSON válido en la respuesta del modelo')
}

// ─── Extraer destino (con fallback sin IA) ────────────────────

/**
 * Palabras a descartar del texto libre antes de buscar la ruta.
 *
 * Se filtra por palabra completa, no por subcadena: quitar "al" sin delimitar
 * mutilaba nombres reales ("salto" → "s to").
 *
 * Se conservan artículos y preposiciones ("de", "del", "la") porque forman parte
 * de muchos topónimos chilenos: Salto *del* Apoquindo, Cajón *del* Maipo.
 * Se descarta "chile": la fuente es íntegramente chilena y el término, en una
 * búsqueda que exige todos los términos, deja la consulta sin resultados.
 */
const STOPWORDS = new Set([
  // intención
  'quiero', 'quisiera', 'queria', 'quería', 'me', 'gustaria', 'gustaría', 'hacer', 'haria', 'haría',
  'ir', 'voy', 'vamos', 'planifica', 'planificar', 'planificarme', 'planeame', 'planéame', 'arma',
  'armar', 'trekking', 'senderismo', 'caminata', 'excursion', 'excursión', 'subir', 'escalar',
  'visitar', 'conocer', 'como', 'cómo', 'deberia', 'debería', 'puedo', 'podria', 'podría',
  'recomienda', 'recomiendame', 'recomiéndame', 'al', 'un', 'una', 'para',
  // fechas
  'hoy', 'mañana', 'manana', 'este', 'esta', 'proximo', 'próximo', 'proxima', 'próxima', 'siguiente',
  'fin', 'semana', 'finde', 'sabado', 'sábado', 'domingo', 'lunes', 'martes', 'miercoles',
  'miércoles', 'jueves', 'viernes', 'dia', 'día', 'dias', 'días',
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre',
  'octubre', 'noviembre', 'diciembre',
  // país
  'chile', 'chileno', 'chilena',
])

export function cleanQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/[¿?¡!.,;:()"]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w))
    .join(' ')
    .trim()
}

export async function extractDestination(query: string): Promise<{
  location: string
  date: string | null
} | null> {
  // Intento 1: usar Gemini para extraer el destino.
  try {
    const system = 'Eres un extractor de datos. Responde ÚNICAMENTE con JSON válido, sin texto extra ni markdown.'
    const user = `De esta consulta: "${query}"
Responde solo: {"location": "nombre del cerro, sendero o parque", "date": "YYYY-MM-DD o null"}
El campo location debe ser SOLO el nombre propio del lugar, sin el país y sin verbos.
Ejemplo: "quiero ir al cerro La Campana en Olmué el sábado" → {"location": "Cerro La Campana", "date": null}`

    const raw = await chat(system, user)
    const result = extractJSON(raw) as { location: string; date: string | null }
    if (result?.location) {
      console.log('[extractDestination] Gemini extrajo:', result.location)
      return result
    }
  } catch (err) {
    console.error('[extractDestination] Gemini falló, usando fallback:', err)
  }

  // Intento 2: fallback sin IA — quitar las palabras de intención y fecha.
  const cleaned = cleanQuery(query)
  console.log('[extractDestination] Fallback sin IA:', JSON.stringify(cleaned))

  return cleaned.length > 2 ? { location: cleaned, date: null } : null
}

// ─── Generar plan completo ────────────────────────────────────

/** Describe la ruta usando solo los campos que la fuente declara. */
function describeRoute(route: Route): string {
  const lines = [`- Nombre: ${route.name}`]
  if (route.distance_km !== undefined) lines.push(`- Distancia: ${route.distance_km} km`)
  if (route.ascent_m !== undefined) lines.push(`- Desnivel de ascenso: +${route.ascent_m} m`)
  if (route.descent_m !== undefined) lines.push(`- Desnivel de descenso: -${route.descent_m} m`)
  if (route.summit_m !== undefined) lines.push(`- Altitud de cumbre: ${route.summit_m} m`)
  if (route.duration) lines.push(`- Duración declarada: ${route.duration}`)
  if (route.technical_difficulty) lines.push(`- Dificultad técnica: ${route.technical_difficulty}`)
  if (route.trek_type) lines.push(`- Tipo: ${route.trek_type}`)
  if (route.trail_quality) lines.push(`- Estado del sendero: ${route.trail_quality}`)
  if (route.signage) lines.push(`- Señalización: ${route.signage}`)
  if (route.infrastructure) lines.push(`- Infraestructura: ${route.infrastructure}`)
  if (route.attractions.length) lines.push(`- Atractivos: ${route.attractions.join(', ')}`)
  if (route.region) lines.push(`- Zona: ${route.region}`)
  return lines.join('\n')
}

export async function generateTrekPlan(
  route: Route,
  weather: WeatherForecast,
  userProfile: UserProfile,
  originalQuery: string,
): Promise<TrekPlan> {
  const system = `Eres el planificador de trekking de hAIke.
Generas checklists personalizados cruzando datos de ruta, clima y perfil del usuario.
Los datos de la ruta provienen de una fuente documentada: úsalos tal cual, no los recalcules
ni inventes cifras que no aparezcan.
Responde ÚNICAMENTE con un objeto JSON válido. Sin texto, sin markdown, sin explicaciones.
Textos en español chileno.`

  const user = `Consulta: "${originalQuery}"

RUTA (datos declarados por ${route.source}):
${describeRoute(route)}

CLIMA:
- Temperatura: ${weather.temperature_min}°C a ${weather.temperature_max}°C
- Lluvia: ${weather.precipitation_mm} mm
- Viento: ${weather.wind_speed_kmh} km/h (ráfagas ${weather.wind_gusts_kmh} km/h)
- UV: ${weather.uv_index}
- Condición: ${weather.weather_description}
- Amanecer: ${weather.sunrise}

USUARIO:
- Nivel: ${userProfile.fitness_level}
- Experiencia trekking: ${userProfile.experience_trekking ? 'sí' : 'no'}
- Grupo: ${userProfile.group_size ?? 1} persona(s)

Responde exactamente con este JSON:
{
  "departure_recommendation": "hora recomendada y razón breve",
  "food_checklist": [
    {"item": "nombre del ítem", "reason": "razón breve o null", "priority": "essential"}
  ],
  "clothing_checklist": [
    {"item": "nombre del ítem", "reason": "razón breve o null", "priority": "essential"}
  ],
  "gear_checklist": [
    {"item": "nombre del ítem", "reason": "razón breve o null", "priority": "essential"}
  ],
  "tips": ["consejo 1", "consejo 2"],
  "warning": "alerta si hay riesgo climático, o null"
}

Reglas:
- food_checklist: 5-8 ítems. Ajusta el agua a la duración declarada de la ruta.
- clothing_checklist: 6-9 ítems adaptados al clima.
- gear_checklist: 4-6 ítems de seguridad.
- priority: "essential", "recommended" u "optional".
- warning: solo si lluvia > 5mm, viento > 40 km/h o UV > 7.`

  const raw  = await chat(system, user)
  const json = extractJSON(raw) as {
    departure_recommendation: string
    food_checklist:     ChecklistItem[]
    clothing_checklist: ChecklistItem[]
    gear_checklist:     ChecklistItem[]
    tips:               string[]
    warning?:           string
  }

  return {
    route,
    weather,
    departure_recommendation: json.departure_recommendation,
    food_checklist:           json.food_checklist,
    clothing_checklist:       json.clothing_checklist,
    gear_checklist:           json.gear_checklist,
    tips:                     json.tips,
    warning:                  json.warning,
  }
}
