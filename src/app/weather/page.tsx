'use client'

import Link from 'next/link'
import { clsx } from 'clsx'
import { AppShell } from '@/components/AppShell'
import { Icon } from '@/components/Icon'
import { usePlan } from '@/lib/planStore'
import type { TrekPlan } from '@/types'

/** Códigos WMO → icono de Material Symbols. */
function weatherIcon(code: number): string {
  if (code === 0) return 'clear_day'
  if (code <= 2) return 'partly_cloudy_day'
  if (code === 3) return 'cloud'
  if (code <= 48) return 'foggy'
  if (code <= 55) return 'rainy_light'
  if (code <= 65) return 'rainy'
  if (code <= 75) return 'weather_snowy'
  if (code <= 82) return 'rainy_heavy'
  return 'thunderstorm'
}

/** Solo la hora de un timestamp ISO de Open-Meteo ("2026-05-31T07:42"). */
function hourOf(iso: string): string {
  const t = iso.split('T')[1]
  return t ? t.slice(0, 5) : '—'
}

interface Metric {
  label: string
  value: string
  unit: string
  icon: string
  tone?: 'normal' | 'warn' | 'danger'
}

function metricsFor(plan: TrekPlan): Metric[] {
  const w = plan.weather
  return [
    {
      label: 'Viento',
      value: String(Math.round(w.wind_speed_kmh)),
      unit: 'km/h',
      icon: 'air',
      tone: w.wind_speed_kmh > 40 ? 'danger' : w.wind_speed_kmh > 25 ? 'warn' : 'normal',
    },
    {
      label: 'Ráfagas',
      value: String(Math.round(w.wind_gusts_kmh)),
      unit: 'km/h',
      icon: 'storm',
      tone: w.wind_gusts_kmh > 60 ? 'danger' : w.wind_gusts_kmh > 40 ? 'warn' : 'normal',
    },
    {
      label: 'Índice UV',
      value: String(Math.round(w.uv_index)),
      unit: w.uv_index > 7 ? 'muy alto' : w.uv_index > 5 ? 'alto' : 'moderado',
      icon: 'wb_sunny',
      tone: w.uv_index > 7 ? 'danger' : w.uv_index > 5 ? 'warn' : 'normal',
    },
    {
      label: 'Precipitación',
      value: w.precipitation_mm.toFixed(1),
      unit: 'mm',
      icon: 'water_drop',
      tone: w.precipitation_mm > 10 ? 'danger' : w.precipitation_mm > 2 ? 'warn' : 'normal',
    },
  ]
}

const TONE_CLASS = {
  normal: 'text-on-surface',
  warn: 'text-tertiary',
  danger: 'text-error',
} as const

function EmptyState() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center text-center gap-4 px-margin-mobile py-xl">
      <div className="w-16 h-16 rounded-full bg-secondary-container/40 flex items-center justify-center">
        <Icon name="cloudy_snowing" className="text-secondary text-3xl" />
      </div>
      <h1 className="font-headline-md text-headline-md text-on-surface">Sin ruta activa</h1>
      <p className="font-body-lg text-on-surface-variant max-w-md">
        El clima se calcula sobre las coordenadas de tu ruta. Genera un plan en el Planificador y aparecerá aquí el
        pronóstico real de Open-Meteo.
      </p>
      <Link
        href="/planner"
        className="mt-2 bg-primary hover:bg-primary-fixed text-on-primary font-title-md px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
      >
        <Icon name="edit_note" filled />
        Ir al Planificador
      </Link>
    </div>
  )
}

export default function WeatherPage() {
  const { active, hydrated } = usePlan()
  const plan = active?.plan ?? null

  if (!hydrated) {
    return (
      <AppShell>
        <div className="flex-grow" />
      </AppShell>
    )
  }

  if (!plan) {
    return (
      <AppShell>
        <EmptyState />
      </AppShell>
    )
  }

  const w = plan.weather
  const route = plan.route
  const start = route.start
  const metrics = metricsFor(plan)

  return (
    <AppShell>
      <div className="relative flex-grow">
        <div className="topo-bg absolute inset-0 pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-lg space-y-md relative z-10">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
            <div>
              <p className="font-technical-mono text-technical-mono text-primary uppercase tracking-widest mb-xs">
                Ruta activa
              </p>
              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
                {route.name}
              </h1>
              <p className="font-body-md text-on-surface-variant">
                {route.summit_m !== undefined && `${route.summit_m}m cumbre`}
                {start && ` • Lat: ${start.lat.toFixed(3)} Lon: ${start.lon.toFixed(3)}`}
              </p>
            </div>
            <div className="bg-surface-container-high px-md py-sm rounded border border-outline-variant flex items-center gap-md">
              <div className="flex flex-col items-center">
                <span className="font-technical-mono text-technical-mono text-on-surface-variant">PRONÓSTICO</span>
                <span className="font-technical-mono text-technical-mono text-primary">
                  {new Date(active!.savedAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                </span>
              </div>
              <Link
                href="/planner"
                className="bg-primary text-on-primary px-md py-sm rounded-lg font-bold flex items-center gap-sm active:scale-95 transition-transform"
              >
                <Icon name="sync" className="text-[18px]" /> Actualizar
              </Link>
            </div>
          </header>

          {/* Alertas */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="bg-primary-container/20 border border-primary/30 p-md rounded-lg flex gap-md items-start">
              <Icon name="schedule" className="text-primary text-[32px]" />
              <div>
                <h4 className="font-title-lg text-title-lg text-primary mb-xs">Recomendación de salida</h4>
                <p className="font-body-md text-on-background">{plan.departure_recommendation}</p>
                <p className="font-technical-mono text-technical-mono text-on-surface-variant mt-sm">
                  Amanecer {hourOf(w.sunrise)} · Atardecer {hourOf(w.sunset)}
                </p>
              </div>
            </div>
            {plan.warning ? (
              <div className="bg-error-container/20 border border-error/30 p-md rounded-lg flex gap-md items-start">
                <Icon name="warning" className="text-error text-[32px]" />
                <div>
                  <h4 className="font-title-lg text-title-lg text-error mb-xs">Alerta de condiciones</h4>
                  <p className="font-body-md text-on-background">{plan.warning}</p>
                </div>
              </div>
            ) : (
              <div className="bg-secondary-container/20 border border-secondary/30 p-md rounded-lg flex gap-md items-start">
                <Icon name="verified" className="text-secondary text-[32px]" />
                <div>
                  <h4 className="font-title-lg text-title-lg text-secondary mb-xs">Sin alertas activas</h4>
                  <p className="font-body-md text-on-background">
                    No se detectaron condiciones de riesgo para esta ruta en la fecha planificada.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Condiciones + métricas */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-md">
            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-md flex flex-col items-center justify-center text-center gap-sm">
              <Icon name={weatherIcon(w.weather_code)} filled className="text-primary text-[64px]" />
              <div className="flex items-baseline gap-2">
                <span className="font-display-lg text-display-lg text-on-surface leading-none">
                  {Math.round(w.temperature_max)}°
                </span>
                <span className="font-title-lg text-title-lg text-on-surface-variant">
                  / {Math.round(w.temperature_min)}°
                </span>
              </div>
              <p className="font-title-lg text-title-lg text-primary">{w.weather_description}</p>
              <p className="font-technical-mono text-technical-mono text-on-surface-variant uppercase tracking-wider">
                Máx / Mín del día
              </p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-2 gap-md">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="bg-surface-container-low border border-outline-variant rounded-lg p-md flex flex-col gap-xs"
                >
                  <div className="flex items-center gap-sm">
                    <Icon name={m.icon} className="text-on-surface-variant text-[20px]" />
                    <span className="font-technical-mono text-technical-mono text-on-surface-variant uppercase tracking-wider">
                      {m.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={clsx('font-headline-md text-headline-md leading-none', TONE_CLASS[m.tone ?? 'normal'])}>
                      {m.value}
                    </span>
                    <span className="font-body-md text-on-surface-variant">{m.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Datos de la ruta */}
          <section className="bg-surface-container-low border border-outline-variant rounded-lg p-md">
            <h3 className="font-title-lg text-title-lg text-on-surface mb-md flex items-center gap-sm">
              <Icon name="terrain" className="text-tertiary" />
              Perfil de la ruta
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
              {[
                { label: 'Distancia', value: route.distance_km?.toString(), unit: 'km' },
                { label: 'Desnivel +', value: route.ascent_m?.toString(), unit: 'm' },
                { label: 'Cumbre', value: route.summit_m?.toString(), unit: 'm' },
                { label: 'Duración', value: route.duration, unit: '' },
              ]
                .filter((d) => d.value)
                .map((d) => (
                  <div key={d.label} className="flex flex-col gap-xs">
                    <span className="font-technical-mono text-technical-mono text-on-surface-variant uppercase tracking-wider">
                      {d.label}
                    </span>
                    <span className="font-headline-md text-headline-md text-on-surface leading-none">
                      {d.value}
                      {d.unit && <span className="font-body-md text-on-surface-variant ml-1">{d.unit}</span>}
                    </span>
                  </div>
                ))}
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-md">
              Datos declarados por {route.source}
            </p>
          </section>

          {/* Tips */}
          {plan.tips.length > 0 && (
            <section className="bg-surface-container-low border border-outline-variant rounded-lg p-md">
              <h3 className="font-title-lg text-title-lg text-on-surface mb-md flex items-center gap-sm">
                <Icon name="lightbulb" className="text-tertiary" />
                Consejos para estas condiciones
              </h3>
              <ul className="space-y-sm">
                {plan.tips.map((tip, i) => (
                  <li key={i} className="flex gap-sm items-start">
                    <Icon name="check_circle" className="text-primary text-[18px] mt-0.5 flex-shrink-0" />
                    <span className="font-body-md text-on-surface">{tip}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="font-label-caps text-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider text-center">
            Datos de Open-Meteo · Pronóstico de la fecha planificada
          </p>
        </div>
      </div>
    </AppShell>
  )
}
