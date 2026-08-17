'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { Icon } from './Icon'
import type { TrekPlan, ChecklistItem } from '@/types'

/** Métrica declarada por la fuente; se omite si no la publica. */
function Stat({ value, label }: { value?: string; label: string }) {
  if (!value) return null
  return (
    <div className="bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-center flex-1">
      <div className="font-mono-data text-mono-data text-primary">{value}</div>
      <div className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  )
}

function Checklist({ title, items }: { title: string; items: ChecklistItem[] }) {
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const toggle = (i: number) =>
    setChecked((p) => {
      const n = new Set(p)
      n.has(i) ? n.delete(i) : n.add(i)
      return n
    })
  const order = ['essential', 'recommended', 'optional'] as const
  const sorted = [...items].sort((a, b) => order.indexOf(a.priority) - order.indexOf(b.priority))
  const pct = items.length ? Math.round((checked.size / items.length) * 100) : 0

  return (
    <div className="border border-outline-variant rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-surface-container border-b border-outline-variant">
        <div className="flex justify-between items-center mb-2">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{title}</span>
          <span className="font-mono-data text-[11px] text-secondary">
            {checked.size}/{items.length}
          </span>
        </div>
        <div className="w-full h-1 bg-surface-container-highest rounded-full">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ul className="divide-y divide-outline-variant/40">
        {sorted.map((item, i) => {
          const done = checked.has(i)
          return (
            <li key={i}>
              <button
                onClick={() => toggle(i)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-container-high transition-all',
                  done && 'opacity-50',
                )}
              >
                <span
                  className={clsx(
                    'w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-all',
                    done ? 'bg-primary border-transparent' : 'border-outline',
                  )}
                >
                  {done && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#003918" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className={clsx('text-body-md flex-1', done ? 'line-through text-on-surface-variant' : 'text-on-surface')}>
                  {item.item}
                </span>
                {item.priority === 'essential' && !done && (
                  <span className="font-label-caps text-[9px] text-error bg-error-container/40 px-1.5 py-0.5 rounded flex-shrink-0">!</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function PlanCard({ plan }: { plan: TrekPlan }) {
  const { route, weather } = plan
  return (
    <div className="space-y-5 animate-fadeIn">
      {plan.warning && (
        <div className="bg-tertiary/10 border border-tertiary-container/40 rounded-lg px-4 py-3 flex items-start gap-3">
          <Icon name="warning" className="text-tertiary text-[20px]" />
          <p className="text-body-md text-on-tertiary-container">{plan.warning}</p>
        </div>
      )}

      <div>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <h3 className="font-title-lg text-title-lg text-primary">{route.name}</h3>
          {route.technical_difficulty && (
            <span className="px-2 py-0.5 rounded-full font-label-caps text-[10px] uppercase tracking-wider border bg-surface-container-high text-on-surface-variant border-outline-variant">
              {route.technical_difficulty}
            </span>
          )}
        </div>
        <div className="flex gap-2 mb-3 flex-wrap">
          <Stat value={route.distance_km !== undefined ? `${route.distance_km} km` : undefined} label="Distancia" />
          <Stat value={route.ascent_m !== undefined ? `+${route.ascent_m} m` : undefined} label="Desnivel" />
          <Stat value={route.duration} label="Duración" />
        </div>
        <p className="text-body-md text-on-surface-variant bg-surface-container rounded-lg px-3 py-2">
          {plan.departure_recommendation}
        </p>
        <a
          href={route.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider hover:text-primary transition-colors inline-flex items-center gap-1 mt-2"
        >
          Datos de {route.source} <Icon name="open_in_new" className="text-[12px]" />
        </a>
      </div>

      <div>
        <p className="font-label-caps text-label-caps text-secondary uppercase tracking-wider mb-2">
          Clima — {weather.weather_description}
        </p>
        <div className="flex gap-2 flex-wrap">
          <Stat value={`${weather.temperature_min}°/${weather.temperature_max}°`} label="Temp" />
          <Stat value={`${weather.precipitation_mm} mm`} label="Lluvia" />
          <Stat value={`${weather.wind_speed_kmh} km/h`} label="Viento" />
          <Stat value={`UV ${weather.uv_index}`} label="UV" />
        </div>
      </div>

      <Checklist title="Comida y agua" items={plan.food_checklist} />
      <Checklist title="Ropa y abrigo" items={plan.clothing_checklist} />
      <Checklist title="Equipamiento" items={plan.gear_checklist} />

      {plan.tips.length > 0 && (
        <div className="bg-primary-container/10 border border-primary/20 rounded-lg px-4 py-3">
          <p className="font-label-caps text-label-caps text-primary uppercase tracking-wider mb-2">Consejos</p>
          {plan.tips.map((tip, i) => (
            <p key={i} className="text-body-md text-on-surface mb-1 last:mb-0">
              → {tip}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
