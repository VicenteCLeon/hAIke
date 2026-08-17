import Link from 'next/link'
import { clsx } from 'clsx'
import { Icon } from './Icon'
import type { RouteSummary } from '@/types'

/**
 * Dificultad *técnica* declarada por la fuente (escala de Wikiexplora).
 * No es esfuerzo físico: una ruta larga puede ser técnicamente "Muy Fácil".
 */
const DIFFICULTY_STYLE: Record<string, string> = {
  'muy fácil': 'bg-secondary-container text-on-secondary-container border-outline-variant',
  fácil: 'bg-secondary-container text-on-secondary-container border-outline-variant',
  'poco difícil': 'bg-primary-container text-on-primary-container border-outline-variant',
  difícil: 'bg-on-tertiary-fixed-variant text-tertiary-fixed border-tertiary-container',
  'muy difícil': 'bg-error-container text-on-error-container border-error/30',
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const style =
    DIFFICULTY_STYLE[difficulty.toLowerCase()] ??
    'bg-surface-container-high text-on-surface-variant border-outline-variant'
  return (
    <span
      className={clsx(
        'px-3 py-1 border rounded-full font-label-caps text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm',
        style,
      )}
    >
      {difficulty}
    </span>
  )
}

/** Métrica declarada; no se renderiza si la fuente no la publica. */
export function DataPoint({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex flex-col">
      <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">{label}</span>
      <span className="font-mono-data text-mono-data text-primary">{value}</span>
    </div>
  )
}

export function RouteCard({ route }: { route: RouteSummary }) {
  return (
    <Link
      href={`/routes/${route.id}`}
      className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden group flex flex-col h-full relative cursor-pointer hover:border-primary/50 transition-colors"
    >
      <div className="h-32 w-full bg-topo relative border-b border-outline-variant">
        <div className="absolute inset-0 bg-surface-container-highest/60 group-hover:bg-surface-container-highest/40 transition-colors" />
        <div className="absolute bottom-3 left-4 z-10">
          <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider bg-surface-container/80 px-2 py-1 rounded">
            {route.source}
          </span>
        </div>
      </div>
      <div className="p-6 flex flex-col gap-3 flex-grow bg-surface-container-low z-10">
        <h3 className="font-title-lg text-title-lg text-on-surface group-hover:text-primary transition-colors">
          {route.name}
        </h3>
        {route.snippet && (
          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3">{route.snippet}</p>
        )}
        <span className="mt-auto pt-3 font-label-md text-label-md text-primary flex items-center gap-1">
          Ver ficha técnica <Icon name="arrow_forward" className="text-[16px]" />
        </span>
      </div>
    </Link>
  )
}

export function RouteCardSkeleton() {
  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden flex flex-col h-full animate-pulse">
      <div className="h-32 w-full bg-surface-container-high border-b border-outline-variant" />
      <div className="p-6 flex flex-col gap-3 flex-grow">
        <div className="h-5 w-3/4 bg-surface-container-high rounded" />
        <div className="h-4 w-full bg-surface-container-high rounded" />
        <div className="h-4 w-2/3 bg-surface-container-high rounded" />
      </div>
    </div>
  )
}
