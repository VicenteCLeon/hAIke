import Link from 'next/link'
import { AppShell } from '@/components/AppShell'
import { Icon } from '@/components/Icon'
import { DifficultyBadge } from '@/components/RouteCard'
import { SAMPLE_ROUTES, DIFFICULTY_LABEL } from '@/lib/sampleData'

export default async function RouteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const route = SAMPLE_ROUTES.find((r) => r.id === id) ?? SAMPLE_ROUTES[0]
  const est = `${Math.round(route.distance_km / 4)}-${Math.round(route.distance_km / 3)} hrs`

  const tabs = ['Overview', 'Itinerary', 'Gear List', 'Reviews']

  return (
    <AppShell topNav={false}>
      {/* Hero */}
      <header className="relative w-full min-h-[420px] md:min-h-[480px] flex items-end pb-12 px-margin-mobile md:px-margin-desktop bg-topo overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-transparent" />
        <div className="relative z-10 w-full max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <Link href="/routes" className="font-label-md text-label-md text-on-surface-variant hover:text-primary inline-flex items-center gap-1 mb-4">
              <Icon name="arrow_back" className="text-[16px]" /> Volver a rutas
            </Link>
            <span className="font-label-md text-label-md text-secondary tracking-widest uppercase mb-2 block">{route.location}</span>
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4">
              {route.name}
            </h1>
            <div className="flex gap-4 items-center flex-wrap">
              <span className="bg-surface-container-high border border-outline-variant px-3 py-1 rounded-full font-mono-data text-mono-data text-on-surface flex items-center gap-2">
                <Icon name="hiking" className="text-[16px]" /> {route.distance_km}km
              </span>
              <span className="bg-surface-container-high border border-outline-variant px-3 py-1 rounded-full font-mono-data text-mono-data text-on-surface flex items-center gap-2">
                <Icon name="landscape" className="text-[16px]" /> +{route.elevation_gain_m}m
              </span>
              <DifficultyBadge difficulty={route.difficulty} />
            </div>
          </div>

          {/* Elevation chart widget */}
          <div className="w-full md:w-1/3 h-32 relative bg-surface-container-low border border-outline-variant rounded-lg p-4">
            <div className="absolute top-2 left-3 font-label-md text-label-md text-on-surface-variant">Perfil de elevación</div>
            <svg className="w-full h-full mt-4" preserveAspectRatio="none" viewBox="0 0 100 40">
              <defs>
                <linearGradient id="elevGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#91d69d" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#91d69d" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,40 L0,30 Q10,25 20,28 T40,15 T60,20 T80,5 L100,10 L100,40 Z" fill="url(#elevGrad)" />
              <path d="M0,30 Q10,25 20,28 T40,15 T60,20 T80,5 L100,10" fill="none" stroke="#91d69d" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </header>

      {/* Two column */}
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 flex flex-col lg:flex-row gap-gutter w-full">
        <div className="w-full lg:w-2/3 flex flex-col gap-12">
          {/* Tabs (presentational) */}
          <div className="flex gap-8 border-b border-outline-variant overflow-x-auto pb-2">
            {tabs.map((t, i) => (
              <button
                key={t}
                className={
                  i === 0
                    ? 'font-title-lg text-title-lg text-primary border-b-2 border-primary pb-2 whitespace-nowrap'
                    : 'font-title-lg text-title-lg text-on-surface-variant hover:text-primary transition-colors pb-2 whitespace-nowrap'
                }
              >
                {t}
              </button>
            ))}
          </div>

          <section>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              {route.name} es una ruta de dificultad {DIFFICULTY_LABEL[route.difficulty].toLowerCase()} en {route.location}.
              Combina tramos técnicos con vistas alpinas excepcionales, exigiendo un ritmo constante y equipo fiable.
              La exposición sostenida demanda tanto resistencia física como solidez psicológica.
            </p>
          </section>

          {/* AI Synthesis */}
          <section className="bg-surface-container-high border border-outline-variant rounded-xl p-6 relative overflow-hidden ai-pulse">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <Icon name="psychology" className="text-primary" />
              <h3 className="font-title-lg text-title-lg text-primary">Síntesis hAIke</h3>
              <span className="bg-surface-container-highest px-2 py-0.5 rounded font-mono-data text-[11px] text-on-surface-variant">
                47 reseñas analizadas
              </span>
            </div>
            <p className="font-body-lg text-body-lg text-on-surface italic border-l-2 border-primary pl-4">
              &ldquo;Vistas espectaculares en todo el recorrido. Varios reportes de actividad de fauna cerca del punto
              medio: llevar disuasivo es esencial. Las fuentes de agua escasean en el tramo central, planifica en
              consecuencia.&rdquo;
            </p>
          </section>

          {/* Terrain data */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-6 flex flex-col gap-2">
              <Icon name="water_drop" className="text-on-surface-variant" />
              <div className="font-label-md text-label-md text-on-surface-variant">Disponibilidad de agua</div>
              <div className="font-title-lg text-title-lg text-on-surface">Escasa (tramo medio)</div>
            </div>
            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-6 flex flex-col gap-2">
              <Icon name="thermostat" className="text-on-surface-variant" />
              <div className="font-label-md text-label-md text-on-surface-variant">Temp. media</div>
              <div className="font-title-lg text-title-lg text-on-surface">12°C - 24°C</div>
            </div>
          </section>
        </div>

        {/* Sticky logistics */}
        <aside className="w-full lg:w-1/3">
          <div className="sticky top-24 bg-surface-container-low border border-outline-variant rounded-xl p-6 flex flex-col gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <h3 className="font-title-lg text-title-lg text-on-surface">Logística de la ruta</h3>
            <ul className="flex flex-col gap-4 border-t border-outline-variant pt-4">
              <li className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
                <span className="font-body-md text-body-md text-on-surface-variant">Distancia</span>
                <span className="font-mono-data text-mono-data text-on-surface">{route.distance_km} km</span>
              </li>
              <li className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
                <span className="font-body-md text-body-md text-on-surface-variant">Desnivel positivo</span>
                <span className="font-mono-data text-mono-data text-on-surface">+{route.elevation_gain_m} m</span>
              </li>
              <li className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
                <span className="font-body-md text-body-md text-on-surface-variant">Tiempo estimado</span>
                <span className="font-mono-data text-mono-data text-on-surface">{est}</span>
              </li>
            </ul>
            <Link
              href={`/planner?q=${encodeURIComponent(`Planifica un trekking a ${route.name} en ${route.location}`)}`}
              className="w-full bg-primary hover:bg-primary-fixed text-on-primary font-title-lg text-title-lg py-4 rounded-lg flex items-center justify-center gap-2 transition-colors hover:shadow-[0_0_16px_rgba(145,214,157,0.3)]"
            >
              <Icon name="calendar_month" filled />
              Planificar esta ruta
            </Link>
            <button className="w-full bg-transparent border border-outline-variant hover:bg-surface-container-high text-on-surface font-title-lg text-title-lg py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Icon name="download" />
              Descargar GPX
            </button>
          </div>
        </aside>
      </div>
    </AppShell>
  )
}
