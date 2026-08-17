// src/lib/geocoding/index.ts
// Resuelve un nombre de lugar a coordenadas usando Nominatim (OpenStreetMap).
//
// Es una consulta, no una medición: se usa solo para saber dónde pedir el clima
// cuando la ficha de la ruta no declara sus propias coordenadas.

import type { Coordinates } from '@/types'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

export async function geocodeLocation(
  query: string,
): Promise<(Coordinates & { display_name: string }) | null> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '1',
    countrycodes: 'cl',
  })

  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'User-Agent': 'hAIke/1.0 (proyecto academico)' },
    next: { revalidate: 86400 },
  })
  if (!res.ok) return null

  const results = await res.json()
  if (!Array.isArray(results) || !results.length) return null

  const r = results[0]
  return { lat: parseFloat(r.lat), lon: parseFloat(r.lon), display_name: r.display_name }
}
