// src/types/index.ts
// Tipos centrales de hAIke

// ─── Rutas ────────────────────────────────────────────────────
//
// hAIke no mide senderos: consume los datos que una fuente externa ya publica.
// Por eso casi todos los campos son opcionales — la fuente no siempre los
// declara, y es preferible omitir un dato a inventarlo.

export interface Coordinates {
  lat: number
  lon: number
}

/** Resultado de búsqueda: lo mínimo para listar y enlazar. */
export interface RouteSummary {
  id: string
  name: string
  source: string
  source_url: string
  snippet?: string
}

/** Ficha completa, tal como la declara la fuente. */
export interface Route extends RouteSummary {
  distance_km?: number
  ascent_m?: number
  descent_m?: number
  summit_m?: number
  mean_altitude_m?: number
  /** Etiqueta declarada, no calculada: "1 día", "3 horas o menos". */
  duration?: string
  /** Dificultad *técnica* según la fuente: "Muy Fácil", "Fácil", "Poco Difícil". */
  technical_difficulty?: string
  activity?: string
  trek_type?: string
  trail_quality?: string
  signage?: string
  infrastructure?: string
  scenic_beauty?: string
  attractions: string[]
  region?: string
  nearest_city?: string
  round_trip?: string
  distance_note?: string
  start?: Coordinates
  end?: Coordinates
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

// ─── Planificación (respuesta de la IA) ──────────────────────
export interface TrekPlan {
  route: Route
  weather: WeatherForecast
  departure_recommendation: string
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

export interface RoutesResponse {
  success: boolean
  query?: string
  routes?: RouteSummary[]
  error?: string
}
