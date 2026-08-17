'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { clsx } from 'clsx'
import { AppShell } from '@/components/AppShell'
import { Icon } from '@/components/Icon'
import { PlanCard } from '@/components/PlanView'
import { usePlan } from '@/lib/planStore'
import type { TrekPlan, PlanResponse, FitnessLevel } from '@/types'

type Message =
  | { role: 'user'; text: string }
  | { role: 'assistant'; plan: TrekPlan }
  | { role: 'error'; text: string }

const LOADING_MESSAGES = [
  'Analizando topografía...',
  'Consultando senderos...',
  'Revisando el clima...',
  'Generando tu plan...',
]

function TypingBubble() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx((p) => (p + 1) % LOADING_MESSAGES.length), 2000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="flex gap-4 animate-fadeIn">
      <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center mt-1 flex-shrink-0">
        <Icon name="robot_2" className="text-on-primary-container text-sm" />
      </div>
      <div className="bg-surface-container-low border border-outline-variant rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-primary rounded-full typing-dot" />
          <span className="w-2 h-2 bg-primary rounded-full typing-dot" />
          <span className="w-2 h-2 bg-primary rounded-full typing-dot" />
        </div>
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">{LOADING_MESSAGES[idx]}</span>
      </div>
    </div>
  )
}

function ActivePlanSidebar({ plan }: { plan: TrekPlan | null }) {
  return (
    <aside className="w-full lg:w-96 bg-surface border-t lg:border-t-0 lg:border-l border-outline-variant flex flex-col lg:h-[calc(100vh-4rem)] shrink-0">
      <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
        <h2 className="font-title-md text-title-md text-on-surface flex items-center gap-2">
          <Icon name="map" className="text-primary" />
          Itinerario Activo
        </h2>
        {plan?.route.distance_km !== undefined && (
          <span className="bg-surface-container-high px-2 py-1 rounded font-mono-data text-xs text-secondary border border-outline-variant">
            {plan.route.distance_km} KM
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface scrollbar-hide">
        {!plan ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-16 gap-3">
            <Icon name="explore" className="text-on-surface-variant text-4xl opacity-40" />
            <p className="font-body-md text-on-surface-variant">
              Describe tu expedición en el chat y tu itinerario aparecerá aquí.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-title-md text-title-md text-primary">{plan.route.name}</h3>
                <Icon name="landscape" className="text-on-surface-variant text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-on-surface-variant font-mono-data">
                {plan.route.distance_km !== undefined && (
                  <div className="flex items-center gap-1">
                    <Icon name="hiking" className="text-[16px]" /> {plan.route.distance_km}km
                  </div>
                )}
                {plan.route.ascent_m !== undefined && (
                  <div className="flex items-center gap-1">
                    <Icon name="trending_up" className="text-[16px]" /> +{plan.route.ascent_m}m
                  </div>
                )}
                {plan.route.duration && (
                  <div className="flex items-center gap-1">
                    <Icon name="schedule" className="text-[16px]" /> {plan.route.duration}
                  </div>
                )}
                {plan.route.summit_m !== undefined && (
                  <div className="flex items-center gap-1">
                    <Icon name="terrain" className="text-[16px]" /> {plan.route.summit_m}m
                  </div>
                )}
              </div>
            </div>

            <div className="bg-surface-container-highest/50 border border-outline-variant rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                <Icon name="thermostat" className="text-secondary" />
              </div>
              <div>
                <h4 className="font-title-md text-title-md text-sm text-on-surface">{plan.weather.weather_description}</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {plan.weather.temperature_min}° / {plan.weather.temperature_max}° · viento {plan.weather.wind_speed_kmh} km/h
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-4 border-t border-outline-variant bg-surface-container-lowest space-y-3">
        <Link
          href="/gear"
          aria-disabled={!plan}
          className={clsx(
            'w-full font-title-md text-sm py-3 rounded-lg flex justify-center items-center gap-2 transition-all',
            plan
              ? 'bg-primary hover:bg-primary-fixed text-on-primary shadow-[0_0_12px_rgba(145,214,157,0.2)] hover:shadow-[0_0_16px_rgba(145,214,157,0.3)]'
              : 'bg-surface-container-highest text-on-surface-variant pointer-events-none opacity-50',
          )}
        >
          <Icon name="backpack" filled />
          Ver lista de equipaje
        </Link>
        <Link
          href="/weather"
          aria-disabled={!plan}
          className={clsx(
            'w-full bg-transparent border font-title-md text-sm py-3 rounded-lg flex justify-center items-center gap-2 transition-colors',
            plan
              ? 'border-outline hover:border-primary text-on-surface hover:text-primary'
              : 'border-outline-variant text-on-surface-variant pointer-events-none opacity-50',
          )}
        >
          <Icon name="cloudy_snowing" />
          Ver clima de la ruta
        </Link>
      </div>
    </aside>
  )
}

function PlannerWorkspace() {
  const searchParams = useSearchParams()
  const { active, savePlan } = usePlan()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [fitness] = useState<FitnessLevel>('intermediate')
  const bottomRef = useRef<HTMLDivElement>(null)
  const submittedQuery = useRef<string | null>(null)

  // El plan del chat manda; si el usuario vuelve a la página sin chatear,
  // se muestra el último plan persistido.
  const planFromChat =
    [...messages].reverse().find((m): m is Extract<Message, { role: 'assistant' }> => m.role === 'assistant')?.plan ?? null
  const activePlan = planFromChat ?? active?.plan ?? null

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendQuery(text: string) {
    if (!text.trim() || loading) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text }])
    setLoading(true)
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          user_profile: { fitness_level: fitness, experience_trekking: true, group_size: 2 },
        }),
      })
      const data: PlanResponse = await res.json()
      if (!data.success || !data.plan) {
        setMessages((prev) => [...prev, { role: 'error', text: data.error ?? 'Error desconocido' }])
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', plan: data.plan! }])
        // Persistir para que /gear y /weather trabajen sobre este plan.
        savePlan(data.plan, text)
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'error', text: 'No se pudo conectar con el servidor.' }])
    } finally {
      setLoading(false)
    }
  }

  // Auto-submit query coming from the dashboard search (?q=...)
  useEffect(() => {
    const q = searchParams.get('q')
    if (q && submittedQuery.current !== q) {
      submittedQuery.current = q
      void sendQuery(q)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const empty = messages.length === 0 && !loading

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      {/* Chat */}
      <section className="flex-1 flex flex-col lg:h-[calc(100vh-4rem)] bg-surface-container-lowest relative">
        <div className="flex-1 overflow-y-auto px-4 md:px-margin-desktop py-8 scrollbar-hide flex flex-col gap-8">
          {empty && (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center">
                <Icon name="robot_2" filled className="text-on-primary-container text-3xl" />
              </div>
              <h1 className="font-headline-md text-headline-md text-on-surface">Planificador IA</h1>
              <p className="font-body-lg text-on-surface-variant max-w-md">
                Describe tu próxima expedición y generaré un plan técnico con ruta, clima y equipaje.
              </p>
            </div>
          )}

          {messages.map((msg, i) => {
            if (msg.role === 'user') {
              return (
                <div key={i} className="flex gap-4 justify-end animate-fadeIn">
                  <div className="max-w-[80%] bg-surface-container-high border border-outline-variant rounded-2xl rounded-tr-sm p-4 text-on-surface">
                    <p className="font-body-lg text-body-lg">{msg.text}</p>
                  </div>
                </div>
              )
            }
            if (msg.role === 'error') {
              return (
                <div key={i} className="flex gap-4 animate-fadeIn">
                  <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center mt-1 flex-shrink-0">
                    <Icon name="error" className="text-error text-sm" />
                  </div>
                  <div className="max-w-[85%] bg-error-container/20 border border-error/30 rounded-2xl rounded-tl-sm p-4">
                    <p className="font-body-md text-on-error-container">{msg.text}</p>
                  </div>
                </div>
              )
            }
            return (
              <div key={i} className="flex gap-4 animate-fadeIn">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center mt-1 flex-shrink-0">
                  <Icon name="robot_2" className="text-on-primary-container text-sm" />
                </div>
                <div className="max-w-[85%] bg-surface-container-low border border-outline-variant rounded-2xl rounded-tl-sm p-6 text-on-surface shadow-sm flex-1 min-w-0">
                  <PlanCard plan={msg.plan} />
                </div>
              </div>
            )
          })}

          {loading && <TypingBubble />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 md:px-margin-desktop md:pb-8 bg-surface-container-lowest">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void sendQuery(input)
            }}
            className="relative bg-surface-container border border-primary ai-pulse rounded-xl shadow-lg transition-all"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void sendQuery(input)
                }
              }}
              disabled={loading}
              rows={1}
              placeholder="Describe tu expedición o añade restricciones..."
              className="w-full bg-transparent border-none text-on-surface font-body-lg text-body-lg px-4 py-4 pr-16 focus:ring-0 resize-none placeholder-on-surface-variant disabled:opacity-50"
            />
            <div className="absolute right-2 bottom-2">
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-primary hover:bg-primary-fixed disabled:bg-surface-container-highest disabled:text-on-surface-variant text-on-primary rounded-lg w-10 h-10 flex items-center justify-center transition-colors"
              >
                <Icon name="send" filled />
              </button>
            </div>
          </form>
          <p className="text-center font-label-caps text-[10px] text-on-surface-variant mt-2 uppercase tracking-wider">
            hAIke usa OpenStreetMap, Open-Meteo y Gemini · Los datos pueden no ser exactos
          </p>
        </div>
      </section>

      <ActivePlanSidebar plan={activePlan} />
    </div>
  )
}

export default function PlannerPage() {
  return (
    <AppShell footer={false} noPadding>
      <Suspense fallback={null}>
        <PlannerWorkspace />
      </Suspense>
    </AppShell>
  )
}
