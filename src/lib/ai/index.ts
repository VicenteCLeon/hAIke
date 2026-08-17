// src/lib/ai/index.ts
// IA usando Google Gemini (gratis con AI Studio key)

import type { Trail, WeatherForecast, TrekPlan, UserProfile, ChecklistItem } from '@/types'

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

// ─── Regla de Naismith ────────────────────────────────────────
function estimateTime(distanceKm: number, elevationGain: number) {
  const upH   = distanceKm / 5 + elevationGain / 600
  const downH = distanceKm / 5 * 0.6
  const fmt   = (h: number) => {
    const hours = Math.floor(h)
    const mins  = Math.round((h - hours) * 60)
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }
  return { hours: Math.round(upH * 10) / 10, display: `${fmt(upH)} subida · ${fmt(downH)} bajada` }
}

// ─── Extraer destino (con fallback sin IA) ────────────────────
export async function extractDestination(query: string): Promise<{
  location: string; date: string | null
} | null> {

  // Intento 1: usar Gemini para extraer destino
  try {
    const system = 'Eres un extractor de datos. Responde ÚNICAMENTE con JSON válido, sin texto extra ni markdown.'
    const user   = `De esta consulta: "${query}"
Responde solo: {"location": "nombre del lugar en Chile", "date": "YYYY-MM-DD o null"}
Ejemplo: "quiero ir al cerro La Campana en Olmué" → {"location": "cerro La Campana Olmué Chile", "date": null}`

    const raw = await chat(system, user)
    const result = extractJSON(raw) as { location: string; date: string | null }
    if (result?.location) {
      console.log('[extractDestination] Gemini extrajo:', result.location)
      return result
    }
  } catch (err) {
    console.error('[extractDestination] Gemini falló, usando fallback:', err)
  }

  // Intento 2: fallback sin IA — limpiar la consulta y usarla directo
  console.log('[extractDestination] Usando fallback directo con query:', query)
  const cleaned = query
    .toLowerCase()
    .replace(/quiero|hacer|trekking|senderismo|al|a la|en el|en la|como|cómo|debería|planificarme|planificar|ir|un|una|me/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (cleaned.length > 2) {
    return { location: cleaned + ' Chile', date: null }
  }

  return null
}

// ─── Generar plan completo ────────────────────────────────────
export async function generateTrekPlan(
  trail: Trail,
  weather: WeatherForecast,
  userProfile: UserProfile,
  originalQuery: string,
): Promise<TrekPlan> {
  const time = estimateTime(trail.distance_km, trail.elevation_gain_m)

  const system = `Eres el planificador de trekking de hAIke.
Generas checklists personalizados cruzando datos de ruta, clima y perfil del usuario.
Responde ÚNICAMENTE con un objeto JSON válido. Sin texto, sin markdown, sin explicaciones.
Textos en español chileno.`

  const user = `Consulta: "${originalQuery}"

RUTA:
- Nombre: ${trail.name}
- Distancia: ${trail.distance_km} km
- Desnivel: +${trail.elevation_gain_m} m
- Altitud máxima: ${trail.max_elevation_m} m
- Dificultad: ${trail.difficulty}

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

TIEMPO ESTIMADO: ${time.display}

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
- food_checklist: 5-8 ítems. Agua: ~500ml por hora de trekking.
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
    trail,
    weather,
    difficulty_label:         trail.difficulty,
    estimated_time_hours:     time.hours,
    estimated_time_display:   time.display,
    departure_recommendation: json.departure_recommendation,
    food_checklist:           json.food_checklist,
    clothing_checklist:       json.clothing_checklist,
    gear_checklist:           json.gear_checklist,
    tips:                     json.tips,
    warning:                  json.warning,
  }
}
