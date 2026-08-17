// src/lib/sampleData.ts
// Datos de la portada.
//
// Las rutas destacadas son una selección curada que apunta a fichas reales de
// Wikiexplora: aquí solo vive el título y el gancho editorial, nunca cifras.
// Los datos técnicos se leen de la fuente al abrir la ficha.

import { toRouteId } from '@/lib/wikiexplora'
import type { RouteSummary } from '@/types'

const FEATURED_TITLES: { title: string; hook: string }[] = [
  { title: 'Cerro La Campana', hook: 'El clásico de la Cordillera de la Costa, con vista al Aconcagua en días despejados.' },
  { title: 'Laguna Negra', hook: 'Travesía al embalse natural que abastece a Santiago, en pleno Cajón del Maipo.' },
  { title: 'Salto del Apoquindo', hook: 'Salida de medio día desde la ciudad, siguiendo la quebrada hasta la cascada.' },
]

export const FEATURED_ROUTES: RouteSummary[] = FEATURED_TITLES.map(({ title, hook }) => ({
  id: toRouteId(title),
  name: title,
  source: 'Wikiexplora',
  source_url: `https://www.wikiexplora.com/${encodeURIComponent(title.replace(/ /g, '_'))}`,
  snippet: hook,
}))

export const SEARCH_SUGGESTIONS = [
  'Trekking de un día cerca de Santiago',
  'Rutas de varios días en la Patagonia',
]
