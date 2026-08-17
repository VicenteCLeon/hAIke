import Link from 'next/link'
import { clsx } from 'clsx'
import { Icon } from './Icon'
import { DIFFICULTY_LABEL, type SampleRoute, type SampleDifficulty } from '@/lib/sampleData'

export function DifficultyBadge({ difficulty }: { difficulty: SampleDifficulty }) {
  const styles: Record<SampleDifficulty, string> = {
    easy: 'bg-secondary-container text-on-secondary-container border-outline-variant',
    moderate: 'bg-secondary-container text-on-secondary-container border-outline-variant',
    hard: 'bg-on-tertiary-fixed-variant text-tertiary-fixed border-tertiary-container',
  }
  const dot: Record<SampleDifficulty, string> = {
    easy: 'bg-secondary',
    moderate: 'bg-secondary',
    hard: 'bg-tertiary',
  }
  return (
    <span
      className={clsx(
        'px-3 py-1 border rounded-full font-label-caps text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm',
        styles[difficulty],
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', dot[difficulty])} />
      {DIFFICULTY_LABEL[difficulty]}
    </span>
  )
}

export function RouteCard({ route }: { route: SampleRoute }) {
  return (
    <Link
      href={`/routes/${route.id}`}
      className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden group flex flex-col h-full relative cursor-pointer hover:border-primary/50 transition-colors"
    >
      <div className="h-48 w-full bg-topo relative border-b border-outline-variant">
        <div className="absolute inset-0 bg-surface-container-highest/60 group-hover:bg-surface-container-highest/40 transition-colors" />
        <div className="absolute top-4 left-4">
          <DifficultyBadge difficulty={route.difficulty} />
        </div>
      </div>
      <div className="p-6 flex flex-col gap-4 flex-grow bg-surface-container-low z-10">
        <div>
          <h3 className="font-title-lg text-title-lg text-on-surface mb-1 group-hover:text-primary transition-colors">
            {route.name}
          </h3>
          <p className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
            <Icon name="location_on" className="text-[16px]" /> {route.location}
          </p>
        </div>
        <div className="mt-auto pt-4 border-t border-outline-variant grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">Distancia</span>
            <span className="font-mono-data text-mono-data text-primary">{route.distance_km.toFixed(1)} km</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">Desnivel</span>
            <span className="font-mono-data text-mono-data text-primary">
              +{route.elevation_gain_m.toLocaleString('es')} m
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
