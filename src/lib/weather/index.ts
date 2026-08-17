// src/lib/weather/index.ts
// Obtiene forecast del día desde Open-Meteo (sin API key)

import type { WeatherForecast } from '@/types'

const BASE_URL = 'https://api.open-meteo.com/v1/forecast'

// Códigos WMO → descripción en español
const WMO_DESCRIPTIONS: Record<number, string> = {
  0:  'Despejado',
  1:  'Mayormente despejado', 2: 'Parcialmente nublado', 3: 'Nublado',
  45: 'Niebla', 48: 'Niebla con escarcha',
  51: 'Llovizna leve', 53: 'Llovizna moderada', 55: 'Llovizna intensa',
  61: 'Lluvia leve', 63: 'Lluvia moderada', 65: 'Lluvia intensa',
  71: 'Nieve leve', 73: 'Nieve moderada', 75: 'Nieve intensa',
  80: 'Chubascos leves', 81: 'Chubascos moderados', 82: 'Chubascos fuertes',
  95: 'Tormenta eléctrica', 99: 'Tormenta con granizo',
}

export async function getWeatherForecast(
  lat: number,
  lon: number,
  date?: string,
): Promise<WeatherForecast> {
  const targetDate = date ?? new Date().toISOString().split('T')[0]

  const params = new URLSearchParams({
    latitude:         String(lat),
    longitude:        String(lon),
    daily:            [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
      'uv_index_max',
      'weather_code',
      'sunrise',
      'sunset',
    ].join(','),
    timezone:         'America/Santiago',
    forecast_days:    '7',
  })

  const res = await fetch(`${BASE_URL}?${params}`, {
    next: { revalidate: 3600 },
  })

  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`)

  const data = await res.json()
  const daily = data.daily

  // Encontrar el índice del día solicitado
  const idx = (daily.time as string[]).indexOf(targetDate)
  if (idx === -1) throw new Error(`No hay forecast para la fecha ${targetDate}`)

  const code = daily.weather_code[idx] as number

  return {
    temperature_max:      daily.temperature_2m_max[idx],
    temperature_min:      daily.temperature_2m_min[idx],
    precipitation_mm:     daily.precipitation_sum[idx],
    wind_speed_kmh:       daily.wind_speed_10m_max[idx],
    wind_gusts_kmh:       daily.wind_gusts_10m_max[idx],
    uv_index:             daily.uv_index_max[idx],
    weather_code:         code,
    weather_description:  WMO_DESCRIPTIONS[code] ?? 'Variable',
    sunrise:              daily.sunrise[idx],
    sunset:               daily.sunset[idx],
  }
}
