import { AppShell } from '@/components/AppShell'
import { RouteCard } from '@/components/RouteCard'
import { AISearchBar } from '@/components/AISearchBar'
import { SAMPLE_ROUTES } from '@/lib/sampleData'

export default function RoutesPage() {
  return (
    <AppShell>
      <div className="flex-grow p-margin-mobile md:p-margin-desktop flex flex-col gap-8 max-w-[1280px] mx-auto w-full">
        <div className="flex flex-col gap-2 pb-6 border-b border-outline-variant">
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
            Mis Rutas
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Tus expediciones guardadas y rutas recomendadas, listas para planificar.
          </p>
        </div>

        <div className="max-w-3xl w-full">
          <AISearchBar placeholder="Filtra o busca una nueva ruta..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
          {SAMPLE_ROUTES.map((r) => (
            <RouteCard key={r.id} route={r} />
          ))}
        </div>
      </div>
    </AppShell>
  )
}
