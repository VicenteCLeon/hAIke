'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { Icon } from '@/components/Icon'
import { RouteCard, RouteCardSkeleton } from '@/components/RouteCard'
import type { RouteSummary, RoutesResponse } from '@/types'

const SUGGESTIONS = ['Cerro La Campana', 'Cajón del Maipo', 'Torres del Paine', 'Volcán Villarrica']

function RoutesWorkspace() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryParam = searchParams.get('q') ?? ''

  const [input, setInput] = useState(queryParam)
  const [routes, setRoutes] = useState<RouteSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Evita relanzar la misma búsqueda al re-renderizar.
  const lastSearch = useRef<string | null>(null)

  const search = useCallback(async (q: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/routes?q=${encodeURIComponent(q)}`)
      const data: RoutesResponse = await res.json()
      if (!data.success || !data.routes) {
        setError(data.error ?? 'No se pudo completar la búsqueda.')
        setRoutes([])
        return
      }
      setRoutes(data.routes)
    } catch {
      setError('No se pudo conectar con el servidor.')
      setRoutes([])
    } finally {
      setLoading(false)
    }
  }, [])

  // La URL manda: permite compartir y volver a una búsqueda.
  useEffect(() => {
    if (queryParam && lastSearch.current !== queryParam) {
      lastSearch.current = queryParam
      setInput(queryParam)
      void search(queryParam)
    }
  }, [queryParam, search])

  const submit = (q: string) => {
    const trimmed = q.trim()
    if (!trimmed || loading) return
    router.push(`/routes?q=${encodeURIComponent(trimmed)}`)
  }

  const idle = !queryParam && !loading && !error

  return (
    <div className="flex-grow p-margin-mobile md:p-margin-desktop flex flex-col gap-8 max-w-[1280px] mx-auto w-full">
      <div className="flex flex-col gap-2 pb-6 border-b border-outline-variant">
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
          Explorar Rutas
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Rutas documentadas por la comunidad de Wikiexplora. Distancia, desnivel y duración según la ficha
          publicada — hAIke no estima esos datos.
        </p>
      </div>

      {/* Buscador */}
      <div className="max-w-3xl w-full flex flex-col gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit(input)
          }}
          className="relative bg-surface-container border border-outline-variant focus-within:border-primary rounded-xl transition-colors"
        >
          <Icon
            name="search"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
          />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Busca un cerro, sendero o parque..."
            className="w-full bg-transparent border-none text-on-surface font-body-lg text-body-lg pl-12 pr-28 py-4 focus:ring-0 placeholder-on-surface-variant"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-fixed disabled:bg-surface-container-highest disabled:text-on-surface-variant text-on-primary rounded-lg px-4 py-2 font-title-md text-sm transition-colors"
          >
            Buscar
          </button>
        </form>

        <div className="flex gap-2 flex-wrap">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => submit(s)}
              className="px-3 py-1.5 rounded-full border border-outline-variant hover:border-primary hover:text-primary text-on-surface-variant font-label-md text-label-md transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Estados */}
      {error && (
        <div className="bg-error-container/20 border border-error/30 p-4 rounded flex items-start gap-3">
          <Icon name="error" className="text-error" />
          <div>
            <p className="font-body-md text-on-error-container">{error}</p>
            <button
              onClick={() => queryParam && search(queryParam)}
              className="font-label-md text-label-md text-primary underline underline-offset-2 mt-1"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {idle && (
        <div className="flex flex-col items-center justify-center text-center gap-4 py-16">
          <div className="w-16 h-16 rounded-full bg-secondary-container/40 flex items-center justify-center">
            <Icon name="travel_explore" className="text-secondary text-3xl" />
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Busca tu próxima ruta</h2>
          <p className="font-body-lg text-on-surface-variant max-w-md">
            Más de 500 rutas de Chile con ficha técnica publicada: distancia, desnivel, duración y estado del
            sendero.
          </p>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
          {Array.from({ length: 6 }).map((_, i) => (
            <RouteCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && !error && queryParam && routes.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center gap-3 py-16">
          <Icon name="explore_off" className="text-on-surface-variant text-4xl opacity-40" />
          <h2 className="font-title-lg text-title-lg text-on-surface">Sin resultados</h2>
          <p className="font-body-md text-on-surface-variant max-w-md">
            No hay rutas documentadas con ese nombre. Prueba con el nombre de un cerro, un parque nacional o una
            localidad.
          </p>
        </div>
      )}

      {routes.length > 0 && (
        <>
          <p className="font-technical-mono text-technical-mono text-on-surface-variant uppercase tracking-wider">
            {routes.length} resultado{routes.length === 1 ? '' : 's'} · fuente: {routes[0].source}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
            {routes.map((r) => (
              <RouteCard key={r.id} route={r} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function RoutesPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <RoutesWorkspace />
      </Suspense>
    </AppShell>
  )
}
