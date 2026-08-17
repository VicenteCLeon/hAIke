import Link from 'next/link'
import { AppShell } from '@/components/AppShell'
import { AISearchBar } from '@/components/AISearchBar'
import { RouteCard } from '@/components/RouteCard'
import { Icon } from '@/components/Icon'
import { FEATURED_ROUTES, SEARCH_SUGGESTIONS } from '@/lib/sampleData'

function StatCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 flex flex-col gap-2 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{label}</span>
      {children}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="flex-grow p-margin-mobile md:p-margin-desktop flex flex-col gap-8 max-w-[1280px] mx-auto w-full">
        {/* De dónde salen los datos */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <StatCard label="Rutas documentadas">
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-display-lg text-primary">500+</span>
              <span className="font-body-lg text-body-lg text-on-surface">en Chile</span>
            </div>
          </StatCard>
          <StatCard label="Ficha técnica">
            <div className="flex items-center gap-3 mt-1">
              <Icon name="menu_book" className="text-primary" />
              <span className="font-title-lg text-title-lg text-on-surface">Wikiexplora</span>
            </div>
          </StatCard>
          <StatCard label="Pronóstico">
            <div className="flex items-center gap-3 mt-1">
              <Icon name="cloudy_snowing" className="text-primary" />
              <span className="font-title-lg text-title-lg text-on-surface">Open-Meteo</span>
            </div>
          </StatCard>
        </section>

        {/* AI Search */}
        <section className="flex flex-col gap-6 items-center w-full max-w-3xl mx-auto my-8">
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface text-center">
            Encuentra tu próximo desafío
          </h1>
          <AISearchBar />
          <div className="flex flex-wrap justify-center gap-3 w-full">
            {SEARCH_SUGGESTIONS.map((s) => (
              <Link
                key={s}
                href={`/planner?q=${encodeURIComponent(s)}`}
                className="px-4 py-2 rounded-full border border-outline-variant bg-surface-container hover:border-primary text-on-surface-variant font-label-md transition-colors"
              >
                {s}
              </Link>
            ))}
          </div>
        </section>

        {/* Recommended Routes */}
        <section className="flex flex-col gap-6">
          <div className="flex justify-between items-end border-b border-outline-variant pb-4">
            <h2 className="font-headline-md text-headline-md text-on-surface">Rutas Recomendadas</h2>
            <Link
              href="/routes"
              className="font-label-caps text-label-caps text-primary hover:text-primary-fixed transition-colors flex items-center gap-1 uppercase tracking-wider"
            >
              Ver Todo <Icon name="chevron_right" className="text-[16px]" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
            {FEATURED_ROUTES.map((r) => (
              <RouteCard key={r.id} route={r} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
