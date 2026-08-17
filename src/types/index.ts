// src/types/index.ts
// Tipos centrales de hAIke

// ─── Senderos ────────────────────────────────────────────────
export interface TrailNode {
  lat: number
  lon: number
  elevation?: number
}

export type Difficulty = 'easy' | 'moderate' | 'hard'

export interface Trail {
  osm_id: number
  osm_type: 'way' | 'relation'
  name: string
  difficulty: Difficulty
  distance_km: number
  elevation_gain_m: number
  elevation_loss_m: number
  max_elevation_m: number
  min_elevation_m: number
  surface?: string
  nodes: TrailNode[]
  tags: Record<string, string>
}

// ─── Clima ────────────────────────────────────────────────────
export interface WeatherForecast {
  temperature_max: number
  temperature_min: number
  precipitation_mm: number
  wind_speed_kmh: number
  wind_gusts_kmh: number
  uv_index: number
  weather_code: number          // WMO weather code
  weather_description: string
  sunrise: string
  sunset: string
}

// ─── Planificación (respuesta de Claude) ─────────────────────
export interface TrekPlan {
  trail: Trail
  weather: WeatherForecast
  difficulty_label: Difficulty
  estimated_time_hours: number
  estimated_time_display: string // "5h 30min subida · 1h 30min bajada"
  departure_recommendation: string // "Salir antes de las 8:00 AM"
  food_checklist: ChecklistItem[]
  clothing_checklist: ChecklistItem[]
  gear_checklist: ChecklistItem[]
  tips: string[]
  warning?: string // si hay mal tiempo u otro riesgo
}

export interface ChecklistItem {
  item: string
  reason?: string  // por qué lo recomienda (ej: "UV 8 previsto")
  priority: 'essential' | 'recommended' | 'optional'
}

// ─── Perfil de usuario ────────────────────────────────────────
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced'

export interface UserProfile {
  fitness_level: FitnessLevel
  experience_trekking: boolean
  group_size?: number
  has_children?: boolean
}

// ─── Request / Response API ───────────────────────────────────
export interface PlanRequest {
  query: string          // consulta en lenguaje natural
  date?: string          // ISO date, default = hoy
  user_profile?: UserProfile
}

export interface PlanResponse {
  success: boolean
  plan?: TrekPlan
  error?: string
}
