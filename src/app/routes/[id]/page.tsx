import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { Icon } from '@/components/Icon'
import { DifficultyBadge } from '@/components/RouteCard'
import { getRoute, fromRouteId } from '@/lib/wikiexplora'

/** Campo declarado; se omite por completo si la fuente no lo publica. */
function Fact({ label, value, icon }: { label: string; value?: string; icon: string }) {
  if (!value) return null
  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4 flex flex-col gap-2">
      <Icon name={icon} className="text-on-surface-variant text-[20px]" />
      <span className="font-label-md text-label-md text-on-surface-variant">{label}</span>
      <span className="font-mono-data text-mono-data text-on-surface">{value}</span>
    </div>
  )
}

export default async function RouteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const title = fromRouteId(id)

  let route
  try {
    route = await getRoute(title)
  } catch {
    return (
      <AppShell>
        <div className="flex-grow flex flex-col items-center justify-center text-center gap-4 px-margin-mobile py-xl">
          <Icon name="cloud_off" className="text-tertiary text-4xl" />
          <h1 className="font-headline-md text-headline-md text-on-surface">No pude cargar la ficha</h1>
          <p className="font-body-lg text-on-surface-variant max-w-md">
            La fuente no respondió. Inténtalo de nuevo en unos segundos.
          </p>
          <Link href="/routes" className="text-primary underline underline-offset-2 font-label-md">
            Volver a rutas
          </Link>
        </div>
      </AppShell>
    )
  }

  if (!route) notFound()

  const plannerQuery = `Planifica un trekking en ${route.name}`
  const km = route.distance_km !== undefined ? `${route.distance_km} km` : undefined

  return (
    <AppShell topNav={false}>
      {/* Hero */}
      <header className="relative w-full min-h-[380px] md:min-h-[440px] flex items-end pb-12 px-margin-mobile md:px-margin-desktop bg-topo overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-transparent" />
        <div className="relative z-10 w-full max-w-[1280px] mx-auto">
          <Link
            href="/routes"
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary inline-flex items-center gap-1 mb-4"
          >
            <Icon name="arrow_back" className="text-[16px]" /> Volver a rutas
          </Link>
          {route.region && (
            <span className="font-label-md text-label-md text-secondary tracking-widest uppercase mb-2 block">
              {route.region}
              {route.nearest_city && ` · ${route.nearest_city}`}
            </span>
          )}
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4">
            {route.name}
          </h1>
          <div className="flex gap-3 items-center flex-wrap">
            {km && (
              <span className="bg-surface-container-high border border-outline-variant px-3 py-1 rounded-full font-mono-data text-mono-data text-on-surface flex items-center gap-2">
                <Icon name="hiking" className="text-[16px]" /> {km}
              </span>
            )}
            {route.ascent_m !== undefined && (
              <span className="bg-surface-container-high border border-outline-variant px-3 py-1 rounded-full font-mono-data text-mono-data text-on-surface flex items-center gap-2">
                <Icon name="trending_up" className="text-[16px]" /> +{route.ascent_m.toLocaleString('es')} m
              </span>
            )}
            {route.duration && (
              <span className="bg-surface-container-high border border-outline-variant px-3 py-1 rounded-full font-mono-data text-mono-data text-on-surface flex items-center gap-2">
                <Icon name="schedule" className="text-[16px]" /> {route.duration}
              </span>
            )}
            {route.technical_difficulty && <DifficultyBadge difficulty={route.technical_difficulty} />}
          </div>
        </div>
      </header>

      {/* Dos columnas */}
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 flex flex-col lg:flex-row gap-gutter w-full">
        <div className="w-full lg:w-2/3 flex flex-col gap-12">
          {/* Ficha técnica */}
          <section>
            <h2 className="font-title-lg text-title-lg text-on-surface mb-4">Ficha técnica</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Fact label="Distancia" value={km} icon="hiking" />
              <Fact
                label="Desnivel de ascenso"
                value={route.ascent_m !== undefined ? `+${route.ascent_m.toLocaleString('es')} m` : undefined}
                icon="trending_up"
              />
              <Fact
                label="Desnivel de descenso"
                value={route.descent_m !== undefined ? `-${route.descent_m.toLocaleString('es')} m` : undefined}
                icon="trending_down"
              />
              <Fact
                label="Altitud de cumbre"
                value={route.summit_m !== undefined ? `${route.summit_m.toLocaleString('es')} m` : undefined}
                icon="terrain"
              />
              <Fact
                label="Altitud media"
                value={
                  route.mean_altitude_m !== undefined ? `${route.mean_altitude_m.toLocaleString('es')} m` : undefined
                }
                icon="landscape"
              />
              <Fact label="Duración" value={route.duration} icon="schedule" />
              <Fact label="Dificultad técnica" value={route.technical_difficulty} icon="fitness_center" />
              <Fact label="Tipo de trek" value={route.trek_type} icon="explore" />
              <Fact label="Estado del sendero" value={route.trail_quality} icon="route" />
              <Fact label="Señalización" value={route.signage} icon="signpost" />
              <Fact label="Infraestructura" value={route.infrastructure} icon="cabin" />
              <Fact label="Belleza escénica" value={route.scenic_beauty} icon="photo_camera" />
              <Fact label="Recorrido" value={route.round_trip} icon="sync_alt" />
            </div>
            {route.distance_note && (
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-4 flex items-start gap-2">
                <Icon name="info" className="text-[16px] mt-0.5 flex-shrink-0" />
                {route.distance_note}
              </p>
            )}
          </section>

          {/* Atractivos */}
          {route.attractions.length > 0 && (
            <section>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-4">Atractivos</h2>
              <div className="flex flex-wrap gap-2">
                {route.attractions.map((a) => (
                  <span
                    key={a}
                    className="bg-surface-container-high border border-outline-variant rounded-full px-3 py-1.5 font-label-md text-label-md text-on-surface"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Atribución */}
          <section className="bg-surface-container-low border border-outline-variant rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Icon name="menu_book" className="text-secondary" />
              <div>
                <h3 className="font-title-md text-title-md text-on-surface mb-1">Fuente de los datos</h3>
                <p className="font-body-md text-on-surface-variant mb-3">
                  Toda la información técnica de esta ruta proviene de la ficha publicada en {route.source} por su
                  comunidad. hAIke no calcula ni estima estos valores.
                </p>
                <a
                  href={route.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-label-md text-label-md text-primary hover:underline underline-offset-2 inline-flex items-center gap-1"
                >
                  Ver ficha completa en {route.source} <Icon name="open_in_new" className="text-[14px]" />
                </a>
              </div>
            </div>
          </section>
        </div>

        {/* Logística sticky */}
        <aside className="w-full lg:w-1/3">
          <div className="sticky top-8 bg-surface-container-low border border-outline-variant rounded-xl p-6 flex flex-col gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <h3 className="font-title-lg text-title-lg text-on-surface">Resumen</h3>
            <ul className="flex flex-col gap-4 border-t border-outline-variant pt-4">
              {[
                { label: 'Distancia', value: km },
                {
                  label: 'Desnivel',
                  value: route.ascent_m !== undefined ? `+${route.ascent_m.toLocaleString('es')} m` : undefined,
                },
                { label: 'Duración', value: route.duration },
                { label: 'Dificultad', value: route.technical_difficulty },
              ]
                .filter((r) => r.value)
                .map((r) => (
                  <li
                    key={r.label}
                    className="flex justify-between items-center pb-2 border-b border-outline-variant/30 gap-4"
                  >
                    <span className="font-body-md text-body-md text-on-surface-variant">{r.label}</span>
                    <span className="font-mono-data text-mono-data text-on-surface text-right">{r.value}</span>
                  </li>
                ))}
            </ul>
            <Link
              href={`/planner?q=${encodeURIComponent(plannerQuery)}`}
              className="w-full bg-primary hover:bg-primary-fixed text-on-primary font-title-lg text-title-lg py-4 rounded-lg flex items-center justify-center gap-2 transition-colors hover:shadow-[0_0_16px_rgba(145,214,157,0.3)]"
            >
              <Icon name="calendar_month" filled />
              Planificar esta ruta
            </Link>
            {route.start && (
              <a
                href={`https://www.google.com/maps?q=${route.start.lat},${route.start.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-transparent border border-outline-variant hover:border-primary text-on-surface hover:text-primary font-title-md text-sm py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Icon name="location_on" />
                Ver punto de inicio
              </a>
            )}
          </div>
        </aside>
      </div>
    </AppShell>
  )
}
