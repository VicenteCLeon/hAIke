// src/lib/overpass/index.ts
import type { Trail, TrailNode, Difficulty } from '@/types'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

const SAC_SCALE_MAP: Record<string, Difficulty> = {
  hiking:                      'easy',
  mountain_hiking:             'moderate',
  demanding_mountain_hiking:   'moderate',
  alpine_hiking:               'hard',
  demanding_alpine_hiking:     'hard',
  difficult_alpine_hiking:     'hard',
}

function buildQuery(lat: number, lon: number, radiusM = 15000): string {
  return '[out:json][timeout:30];' +
    '(way["highway"="path"]["name"](around:' + radiusM + ',' + lat + ',' + lon + ');' +
    'way["highway"="footway"]["name"](around:' + radiusM + ',' + lat + ',' + lon + ');' +
    'way["highway"="track"]["name"](around:' + radiusM + ',' + lat + ',' + lon + ');' +
    'relation["route"="hiking"]["name"](around:' + radiusM + ',' + lat + ',' + lon + ');' +
    ');out body geom;'
}

function parseNodes(geometry: Array<{ lat: number; lon: number }>): TrailNode[] {
  return geometry.map(g => ({ lat: g.lat, lon: g.lon }))
}

function haversineKm(a: TrailNode, b: TrailNode): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLon = ((b.lon - a.lon) * Math.PI) / 180
  const sin2 = Math.sin(dLat / 2) ** 2
    + Math.cos((a.lat * Math.PI) / 180)
    * Math.cos((b.lat * Math.PI) / 180)
    * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(sin2))
}

function calcDistanceKm(nodes: TrailNode[]): number {
  let total = 0
  for (let i = 1; i < nodes.length; i++) total += haversineKm(nodes[i - 1], nodes[i])
  return Math.round(total * 100) / 100
}

function calcDifficulty(distanceKm: number, elevationGain: number, maxSlopePct: number): Difficulty {
  const score = distanceKm * 0.3 + elevationGain * 0.005 + maxSlopePct * 0.2
  if (score < 3) return 'easy'
  if (score < 7) return 'moderate'
  return 'hard'
}

function calcElevationStats(nodes: TrailNode[]) {
  const elevations = nodes.map(n => n.elevation ?? 0).filter(e => e > 0)
  if (elevations.length < 2) return { gain: 0, loss: 0, max: 0, min: 0, maxSlope: 0 }
  let gain = 0, loss = 0, maxSlope = 0
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1].elevation ?? 0
    const curr = nodes[i].elevation ?? 0
    const diff = curr - prev
    if (diff > 0) gain += diff
    else loss += Math.abs(diff)
    const dist = haversineKm(nodes[i - 1], nodes[i]) * 1000
    if (dist > 0) maxSlope = Math.max(maxSlope, Math.abs(diff) / dist * 100)
  }
  return { gain: Math.round(gain), loss: Math.round(loss), max: Math.max(...elevations), min: Math.min(...elevations), maxSlope: Math.round(maxSlope) }
}

export async function searchTrails(lat: number, lon: number, radiusM = 15000): Promise<Trail[]> {
  const query = buildQuery(lat, lon, radiusM)

  console.log('[Overpass] Buscando senderos en:', lat, lon)
  console.log('[Overpass] Query:', query)

  const res = await fetch(OVERPASS_URL, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': '*/*',
      'User-Agent': 'hAIke/1.0',
    },
    body:  'data=' + encodeURIComponent(query),
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('[Overpass error]', res.status, text.substring(0, 300))
    throw new Error(`Overpass error: ${res.status}`)
  }

  const data = await res.json()
  const elements: any[] = data.elements ?? []

  console.log('[Overpass] Encontrados:', elements.length, 'elementos')

  const trails: Trail[] = []

  for (const el of elements) {
    if (!el.geometry || el.geometry.length < 2) continue
    const tags: Record<string, string> = el.tags ?? {}
    const name = tags.name ?? tags['name:es'] ?? 'Sendero sin nombre'
    const nodes = parseNodes(el.geometry)
    const distanceKm = calcDistanceKm(nodes)
    const elevStats = calcElevationStats(nodes)
    const sacScale = tags.sac_scale ?? ''
    const difficulty: Difficulty = SAC_SCALE_MAP[sacScale]
      ?? calcDifficulty(distanceKm, elevStats.gain, elevStats.maxSlope)

    trails.push({
      osm_id:           el.id,
      osm_type:         el.type,
      name,
      difficulty,
      distance_km:      distanceKm,
      elevation_gain_m: elevStats.gain,
      elevation_loss_m: elevStats.loss,
      max_elevation_m:  elevStats.max,
      min_elevation_m:  elevStats.min,
      surface:          tags.surface,
      nodes,
      tags,
    })
  }

  console.log('[Overpass] Senderos procesados:', trails.length)

  return trails.sort((a, b) => {
    const scoreA = (a.elevation_gain_m > 0 ? 1 : 0) + (a.distance_km > 0 ? 1 : 0)
    const scoreB = (b.elevation_gain_m > 0 ? 1 : 0) + (b.distance_km > 0 ? 1 : 0)
    return scoreB - scoreA
  })
}

export async function geocodeLocation(query: string): Promise<{ lat: number; lon: number; display_name: string } | null> {
  console.log('[Nominatim] Geocodificando:', query)

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=cl`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'hAIke/1.0 (proyecto de titulo)' },
    next:    { revalidate: 86400 },
  })
  if (!res.ok) return null
  const results = await res.json()
  if (!results.length) return null
  const r = results[0]

  console.log('[Nominatim] Encontrado:', r.display_name, '→', r.lat, r.lon)

  return { lat: parseFloat(r.lat), lon: parseFloat(r.lon), display_name: r.display_name }
}