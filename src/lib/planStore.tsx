'use client'

// src/lib/planStore.tsx
// Store global del TrekPlan activo, persistido en localStorage.
// Permite que el plan generado en /planner alimente a /gear y /weather.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { TrekPlan } from '@/types'

const STORAGE_KEY = 'haike-active-plan'
const STORAGE_VERSION = 1

export interface StoredPlan {
  plan: TrekPlan
  query: string
  savedAt: string // ISO
}

interface PersistedState {
  version: number
  active: StoredPlan | null
  checkedGear: string[]
}

interface PlanContextValue {
  /** Plan activo, o null si el usuario todavía no generó ninguno. */
  active: StoredPlan | null
  /** false durante el primer render (SSR y pre-hidratación). Evita parpadeos. */
  hydrated: boolean
  /** Claves de ítems de equipaje marcados. */
  checkedGear: string[]
  savePlan: (plan: TrekPlan, query: string) => void
  clearPlan: () => void
  toggleGear: (key: string) => void
}

const PlanContext = createContext<PlanContextValue | null>(null)

function readStorage(): PersistedState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedState
    // Descarta formatos antiguos en lugar de renderizar datos incompletos.
    if (parsed?.version !== STORAGE_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

function writeStorage(state: PersistedState) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Cuota llena o modo privado: la app sigue funcionando en memoria.
  }
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<StoredPlan | null>(null)
  const [checkedGear, setCheckedGear] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Hidratar desde localStorage tras el montaje (no en SSR).
  useEffect(() => {
    const stored = readStorage()
    if (stored) {
      setActive(stored.active)
      setCheckedGear(stored.checkedGear ?? [])
    }
    setHydrated(true)
  }, [])

  // Persistir en cada cambio, una vez hidratado.
  useEffect(() => {
    if (!hydrated) return
    writeStorage({ version: STORAGE_VERSION, active, checkedGear })
  }, [active, checkedGear, hydrated])

  const savePlan = useCallback((plan: TrekPlan, query: string) => {
    setActive({ plan, query, savedAt: new Date().toISOString() })
    // Un plan nuevo trae otro equipaje: los marcados anteriores ya no aplican.
    setCheckedGear([])
  }, [])

  const clearPlan = useCallback(() => {
    setActive(null)
    setCheckedGear([])
  }, [])

  const toggleGear = useCallback((key: string) => {
    setCheckedGear((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }, [])

  const value = useMemo<PlanContextValue>(
    () => ({ active, hydrated, checkedGear, savePlan, clearPlan, toggleGear }),
    [active, hydrated, checkedGear, savePlan, clearPlan, toggleGear],
  )

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
}

export function usePlan() {
  const ctx = useContext(PlanContext)
  if (!ctx) throw new Error('usePlan debe usarse dentro de <PlanProvider>')
  return ctx
}
