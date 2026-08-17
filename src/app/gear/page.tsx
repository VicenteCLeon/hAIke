'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { clsx } from 'clsx'
import { AppShell } from '@/components/AppShell'
import { Icon } from '@/components/Icon'
import { usePlan } from '@/lib/planStore'
import { estimateGrams, recommendedKg } from '@/lib/gearWeights'
import type { ChecklistItem, TrekPlan } from '@/types'

interface GearItem {
  key: string
  name: string
  grams: number
  reason?: string
  priority: ChecklistItem['priority']
}
interface GearCategory {
  id: string
  title: string
  icon: string
  wide?: boolean
  items: GearItem[]
}

// Lista de referencia cuando todavía no hay un plan generado.
const SAMPLE: GearCategory[] = [
  {
    id: 'shelter',
    title: 'Refugio & Dormir',
    icon: 'holiday_village',
    items: [
      { key: 'sample:s1', name: 'Saco de dormir (-5°C)', grams: 1200, priority: 'essential' },
      { key: 'sample:s2', name: 'Esterilla inflable R-Value 4', grams: 450, priority: 'recommended' },
      { key: 'sample:s3', name: 'Tienda ultraligera 1P', grams: 750, priority: 'recommended' },
    ],
  },
  {
    id: 'clothing',
    title: 'Ropa Técnica',
    icon: 'checkroom',
    items: [
      { key: 'sample:c1', name: 'Capa base lana merino x2', grams: 400, priority: 'essential' },
      { key: 'sample:c2', name: 'Chaqueta Hardshell Gore-Tex', grams: 350, priority: 'essential' },
      { key: 'sample:c3', name: 'Pantalones de trekking convertibles', grams: 320, priority: 'recommended' },
    ],
  },
  {
    id: 'food',
    title: 'Comida & Hidratación',
    icon: 'restaurant',
    wide: true,
    items: [
      { key: 'sample:f1', name: 'Liofilizados (Cenas x3)', grams: 450, priority: 'recommended' },
      { key: 'sample:f2', name: 'Filtro de agua por gravedad', grams: 320, priority: 'recommended' },
      { key: 'sample:f3', name: 'Sales y Electrolitos', grams: 100, priority: 'optional' },
      { key: 'sample:f4', name: 'Vejiga de hidratación 3L (llena)', grams: 3100, priority: 'essential' },
    ],
  },
]

/** Convierte los tres checklists del TrekPlan en categorías con peso estimado. */
function categoriesFromPlan(plan: TrekPlan): GearCategory[] {
  const build = (id: string, list: ChecklistItem[]): GearItem[] =>
    list.map((it, i) => ({
      key: `${id}:${i}:${it.item}`,
      name: it.item,
      grams: estimateGrams(it.item, it.priority),
      reason: it.reason ?? undefined,
      priority: it.priority,
    }))

  return [
    { id: 'gear', title: 'Equipo Técnico', icon: 'handyman', items: build('gear', plan.gear_checklist) },
    { id: 'clothing', title: 'Ropa Técnica', icon: 'checkroom', items: build('clothing', plan.clothing_checklist) },
    {
      id: 'food',
      title: 'Comida & Hidratación',
      icon: 'restaurant',
      wide: true,
      items: build('food', plan.food_checklist),
    },
  ].filter((c) => c.items.length > 0)
}

const PRIORITY_STYLE: Record<ChecklistItem['priority'], { label: string; cls: string }> = {
  essential: { label: 'Esencial', cls: 'bg-primary-container text-on-primary-container' },
  recommended: { label: 'Recomendado', cls: 'bg-secondary-container/60 text-secondary' },
  optional: { label: 'Opcional', cls: 'bg-surface-container-highest text-on-surface-variant' },
}

function GearRow({ item, checked, onToggle }: { item: GearItem; checked: boolean; onToggle: () => void }) {
  const badge = PRIORITY_STYLE[item.priority] ?? PRIORITY_STYLE.recommended
  return (
    <li>
      <button
        onClick={onToggle}
        aria-pressed={checked}
        className="w-full flex items-start gap-4 p-2 hover:bg-surface-container-high rounded transition-colors text-left"
      >
        <span
          className={clsx(
            'w-5 h-5 rounded-sm border flex items-center justify-center transition-colors mt-0.5 flex-shrink-0',
            checked ? 'bg-primary border-transparent' : 'border-outline-variant',
          )}
        >
          {checked && (
            <svg className="w-3 h-3" fill="none" stroke="#003918" strokeWidth="3" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-2 flex-wrap">
            <span
              className={clsx(
                'font-body-md text-body-md',
                checked ? 'line-through text-on-surface-variant' : 'text-on-surface',
              )}
            >
              {item.name}
            </span>
            <span className={clsx('px-2 py-0.5 rounded-full font-label-md text-[10px] uppercase', badge.cls)}>
              {badge.label}
            </span>
          </span>
          {item.reason && (
            <span className="block font-body-sm text-body-sm text-on-surface-variant mt-0.5">{item.reason}</span>
          )}
        </span>
        <span className="font-technical-mono text-technical-mono text-secondary mt-0.5 flex-shrink-0">
          ~{item.grams}g
        </span>
      </button>
    </li>
  )
}

export default function GearPage() {
  const { active, hydrated, checkedGear, toggleGear } = usePlan()
  const plan = active?.plan ?? null

  const categories = useMemo(() => (plan ? categoriesFromPlan(plan) : SAMPLE), [plan])

  const { totalKg, recKg, pct } = useMemo(() => {
    const grams = categories
      .flatMap((c) => c.items)
      .filter((i) => checkedGear.includes(i.key))
      .reduce((s, i) => s + i.grams, 0)
    const total = grams / 1000
    const rec = plan ? recommendedKg(plan.estimated_time_hours) : 10
    return { totalKg: total, recKg: rec, pct: Math.round((total / rec) * 100) }
  }, [categories, checkedGear, plan])

  const categoryKg = (cat: GearCategory) => (cat.items.reduce((s, i) => s + i.grams, 0) / 1000).toFixed(1)
  const overloaded = pct > 100

  return (
    <AppShell>
      <div className="flex-grow p-margin-mobile md:p-margin-desktop flex flex-col gap-gutter max-w-[1280px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-outline-variant/50">
          <div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-2">
              Lista de Equipaje
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              {plan ? (
                <>
                  Generada por hAIke IA para{' '}
                  <span className="text-primary">{plan.trail.name}</span> · {plan.trail.distance_km} km ·{' '}
                  {plan.estimated_time_display}
                </>
              ) : (
                'Gestión inteligente de carga basada en predicciones de la ruta. Optimizado para máximo rendimiento.'
              )}
            </p>
          </div>
          <Link
            href="/planner"
            className="inline-flex items-center gap-2 px-6 py-3 rounded border border-outline hover:border-primary text-on-surface hover:text-primary transition-colors font-title-lg text-[14px] self-start lg:self-end"
          >
            <Icon name="edit_note" />
            {plan ? 'Regenerar plan' : 'Crear un plan'}
          </Link>
        </div>

        {/* Banner cuando no hay plan */}
        {hydrated && !plan && (
          <div className="bg-secondary-container/20 border border-secondary/30 p-4 rounded flex items-start gap-3">
            <Icon name="info" className="text-secondary" />
            <p className="font-body-md text-body-md text-on-surface">
              Estás viendo una lista de ejemplo. Genera un plan en el{' '}
              <Link href="/planner" className="text-primary underline underline-offset-2">
                Planificador
              </Link>{' '}
              y tu equipaje se armará automáticamente según la ruta, el clima y tu perfil.
            </p>
          </div>
        )}

        {/* Progress */}
        <div className="bg-surface-container-low border border-outline-variant rounded p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="w-full">
              <div className="flex justify-between items-end mb-3">
                <span className="font-title-lg text-title-lg text-on-surface">Carga Actual</span>
                <div className="text-right">
                  <span
                    className={clsx(
                      'font-display-lg text-display-lg leading-none',
                      overloaded ? 'text-error' : 'text-primary',
                    )}
                  >
                    {totalKg.toFixed(1)}
                    <span className="text-title-lg">kg</span>
                  </span>
                  <span className="font-technical-mono text-technical-mono text-secondary ml-2">
                    / Rec: {recKg.toFixed(1)}kg
                  </span>
                </div>
              </div>
              <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden border border-outline-variant/50">
                <div
                  className={clsx('h-full relative transition-all duration-500', overloaded ? 'bg-error' : 'bg-primary')}
                  style={{ width: `${Math.min(100, pct)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                </div>
              </div>
            </div>
            <div
              className={clsx(
                'hidden md:flex flex-shrink-0 flex-col items-center justify-center p-4 rounded border',
                overloaded ? 'border-error/20 bg-error/5' : 'border-primary/20 bg-primary/5',
              )}
            >
              <Icon
                name={overloaded ? 'warning' : 'check_circle'}
                className={clsx('mb-1', overloaded ? 'text-error' : 'text-primary')}
              />
              <span
                className={clsx(
                  'font-label-md text-label-md text-center leading-tight',
                  overloaded ? 'text-error' : 'text-primary',
                )}
              >
                {overloaded ? (
                  <>
                    Sobre
                    <br />
                    carga
                  </>
                ) : (
                  <>
                    Rango
                    <br />
                    Óptimo
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-gutter">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={clsx(
                'bg-surface-container-low border border-outline-variant rounded p-6 flex flex-col gap-4',
                cat.wide && 'xl:col-span-2',
              )}
            >
              <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-4">
                <Icon name={cat.icon} className="text-tertiary" />
                <h3 className="font-title-lg text-title-lg text-on-surface">{cat.title}</h3>
                <span className="ml-auto font-technical-mono text-technical-mono text-secondary">
                  {categoryKg(cat)}kg
                </span>
              </div>
              <ul className={clsx('gap-x-8 gap-y-1', cat.wide ? 'grid grid-cols-1 md:grid-cols-2' : 'space-y-1')}>
                {cat.items.map((item) => (
                  <GearRow
                    key={item.key}
                    item={item}
                    checked={checkedGear.includes(item.key)}
                    onToggle={() => toggleGear(item.key)}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Alerta del plan */}
        {plan?.warning && (
          <div className="bg-tertiary/10 border border-tertiary-container/30 p-4 rounded flex items-center gap-3">
            <Icon name="warning" className="text-tertiary" />
            <p className="font-body-md text-body-md text-on-tertiary-container">{plan.warning}</p>
          </div>
        )}

        <p className="font-label-caps text-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider text-center">
          Los pesos son estimaciones de equipo estándar · Verifica el gramaje real de tu equipo
        </p>
      </div>
    </AppShell>
  )
}
