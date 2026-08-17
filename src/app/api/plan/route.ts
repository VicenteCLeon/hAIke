// src/app/api/plan/route.ts
// Endpoint principal: recibe consulta → devuelve plan completo

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { extractDestination, generateTrekPlan } from '@/lib/ai'
import { geocodeLocation, searchTrails } from '@/lib/overpass'
import { getWeatherForecast } from '@/lib/weather'
import type { UserProfile, PlanResponse } from '@/types'

// Validación del body
const PlanRequestSchema = z.object({
  query: z.string().min(5, 'La consulta debe tener al menos 5 caracteres'),
  date:  z.string().optional(),
  user_profile: z.object({
    fitness_level:       z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
    experience_trekking: z.boolean().default(false),
    group_size:          z.number().int().min(1).max(50).optional(),
    has_children:        z.boolean().optional(),
  }).optional(),
})

export async function POST(req: NextRequest) {
  try {
    // 1. Validar body
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
      fitness_level:       user_profile?.fitness_level       ?? 'intermediate',
      experience_trekking: user_profile?.experience_trekking ?? false,
      group_size:          user_profile?.group_size,
      has_children:        user_profile?.has_children,
    }

    // 2. Claude extrae el destino del texto libre
    const destination = await extractDestination(query)
    if (!destination?.location) {
      return NextResponse.json<PlanResponse>(
        { success: false, error: 'No pude identificar el destino. Intenta con algo como "cerro La Campana en Olmué".' },
        { status: 422 },
      )
    }

    // 3. Geocodificar destino → coordenadas
    const coords = await geocodeLocation(destination.location)
    if (!coords) {
      return NextResponse.json<PlanResponse>(
        { success: false, error: `No encontré "${destination.location}" en el mapa. Intenta ser más específico.` },
        { status: 404 },
      )
    }

    // 4. Buscar senderos cercanos en OSM
    const trails = await searchTrails(coords.lat, coords.lon, 15000)
    if (!trails.length) {
      return NextResponse.json<PlanResponse>(
        { success: false, error: 'No encontré senderos registrados en esa zona. Prueba con otro destino.' },
        { status: 404 },
      )
    }

    // Tomar el sendero más relevante (primer resultado)
    const trail = trails[0]

    // 5. Obtener clima
    const targetDate = destination.date ?? date ?? new Date().toISOString().split('T')[0]
    const weather = await getWeatherForecast(coords.lat, coords.lon, targetDate)

    // 6. Claude genera el plan completo
    const plan = await generateTrekPlan(trail, weather, userProfile, query)

    return NextResponse.json<PlanResponse>({ success: true, plan })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado'
    console.error('[/api/plan]', message)
    return NextResponse.json<PlanResponse>(
      { success: false, error: message },
      { status: 500 },
    )
  }
}
