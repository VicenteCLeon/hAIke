// src/app/api/routes/route.ts
// Búsqueda de rutas documentadas.
//
//   GET /api/routes?q=cerro la campana
//
// Los datos provienen de Wikiexplora: hAIke no mide senderos, los consulta.

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { findRoutes } from '@/lib/wikiexplora'
import type { RoutesResponse } from '@/types'

const QuerySchema = z.object({
  q: z.string().min(2, 'Escribe al menos 2 caracteres.'),
  limit: z.coerce.number().int().min(1).max(30).default(12),
})

export async function GET(req: NextRequest) {
  try {
    const parsed = QuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
    if (!parsed.success) {
      return NextResponse.json<RoutesResponse>(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 },
      )
    }

    const { q, limit } = parsed.data
    const routes = await findRoutes(q, limit)

    return NextResponse.json<RoutesResponse>({ success: true, query: q, routes })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado'
    console.error('[/api/routes]', message)
    return NextResponse.json<RoutesResponse>({ success: false, error: message }, { status: 500 })
  }
}
