// Datos de ejemplo para las pantallas aún no conectadas al backend.
// Se irán reemplazando por datos reales paso a paso.

export type SampleDifficulty = 'easy' | 'moderate' | 'hard'

export interface SampleRoute {
  id: string
  name: string
  location: string
  difficulty: SampleDifficulty
  distance_km: number
  elevation_gain_m: number
}

export const DIFFICULTY_LABEL: Record<SampleDifficulty, string> = {
  easy: 'Fácil',
  moderate: 'Moderado',
  hard: 'Difícil',
}

export const SAMPLE_ROUTES: SampleRoute[] = [
  { id: 'fitz-roy-loop', name: 'Fitz Roy Loop', location: 'Patagonia, Argentina', difficulty: 'hard', distance_km: 24.0, elevation_gain_m: 1200 },
  { id: 'circuito-o', name: 'Circuito O', location: 'Torres del Paine, Chile', difficulty: 'moderate', distance_km: 130.5, elevation_gain_m: 4500 },
  { id: 'aconcagua-normal', name: 'Aconcagua Normal', location: 'Mendoza, Argentina', difficulty: 'hard', distance_km: 65.0, elevation_gain_m: 4000 },
]

export const USER_STATS = {
  completed: 12,
  distance_km: 450,
  next_trek: 'Torres del Paine',
}

export const SEARCH_SUGGESTIONS = [
  'Rutas de 2 días en Patagonia',
  'Ascensiones técnicas en Alpes',
]
