import { AppShell } from '@/components/AppShell'
import { Icon } from '@/components/Icon'

function Avatar({ name, className = '' }: { name: string; className?: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
  return (
    <div className={`flex items-center justify-center bg-surface-container-highest text-primary font-bold ${className}`}>
      {initials}
    </div>
  )
}

const GROUPS = [
  {
    icon: 'landscape',
    iconColor: 'text-primary',
    hover: 'hover:border-primary',
    tag: 'TECHNICAL_LEVEL: 05',
    title: 'Alpinismo Técnico',
    desc: 'Expertos en alta montaña y rutas de grado superior. Foco en seguridad y rescate.',
    members: '+42',
    active: 'Activo hace 2h',
  },
  {
    icon: 'backpack',
    iconColor: 'text-secondary',
    hover: 'hover:border-secondary',
    tag: 'PHILOSOPHY: LNT',
    title: 'Senderismo Ultra-light',
    desc: 'Optimización de carga y equipo minimalista para travesías de larga distancia.',
    members: '+156',
    active: 'Activo ahora',
  },
]

const TIPS = [
  { icon: 'ac_unit', wrap: 'bg-secondary-container/30 border-secondary/20', iconColor: 'text-secondary', hover: 'hover:border-primary', title: 'Tip: Gestión de capas en frío extremo', desc: "Aprende la técnica de 'fuelle' para evacuar humedad sin perder calor residual en cotas >4000m." },
  { icon: 'skillet', wrap: 'bg-tertiary-container/20 border-tertiary/20', iconColor: 'text-tertiary', hover: 'hover:border-tertiary', title: 'Receta: Liofilizado Casero Energético', desc: 'Mix de quinoa roja, frutos secos y especias termogénicas para recuperación rápida post-ascenso.' },
  { icon: 'visibility', wrap: 'bg-secondary-container/30 border-secondary/20', iconColor: 'text-secondary', hover: 'hover:border-primary', title: 'Tip: Lectura de grietas en glaciar', desc: 'Identificación de puentes de nieve débiles mediante patrones de sombras en luz rasante.' },
]

const EVENTS = [
  { month: 'DIC', day: '12', title: 'Travesía Nocturna Glaciar', icon: 'location_on', place: 'Parque Nacional Nevados' },
  { month: 'ENE', day: '05', title: 'Taller: Supervivencia Nivel II', icon: 'psychology', place: 'Sierra Madre - Campo Base' },
]

const BARS = ['h-1/2', 'h-3/4', 'h-2/3', 'h-full', 'h-4/5', 'h-1/3', 'h-2/3']

export default function CommunityPage() {
  return (
    <AppShell>
      <div className="relative flex-grow">
        <div className="absolute inset-0 topo-bg pointer-events-none opacity-60" />
        <div className="px-margin-mobile md:px-margin-desktop py-lg relative z-10 max-w-[1280px] mx-auto w-full">
          {/* Header */}
          <header className="mb-xl">
            <div className="inline-block bg-surface-container-high px-sm py-xs border border-outline-variant mb-base rounded">
              <span className="font-technical-mono text-technical-mono uppercase text-secondary">Base Camp Hub</span>
            </div>
            <h1 className="font-headline-md text-headline-md text-on-surface mb-sm">Comunidad de Exploradores</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Conecta con montañeros experimentados y comparte tus expediciones. El conocimiento técnico es la mejor
              brújula en terreno desconocido.
            </p>
          </header>

          <div className="grid grid-cols-12 gap-lg">
            {/* Center column */}
            <div className="col-span-12 lg:col-span-8 space-y-xl">
              {/* Grupos */}
              <section>
                <div className="flex justify-between items-end mb-md">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Grupos Destacados</h2>
                  <button className="font-technical-mono text-technical-mono uppercase text-primary hover:underline">Ver todos</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  {GROUPS.map((g) => (
                    <div
                      key={g.title}
                      className={`bg-surface-container-low border border-outline-variant rounded-xl p-md group ${g.hover} transition-colors cursor-pointer relative overflow-hidden flex flex-col`}
                    >
                      <div className="flex items-start justify-between mb-sm">
                        <div className="w-12 h-12 bg-surface-container-highest flex items-center justify-center rounded-lg">
                          <Icon name={g.icon} className={g.iconColor} />
                        </div>
                        <span className="font-technical-mono text-[10px] text-on-surface-variant bg-surface-container px-xs py-[2px] border border-outline-variant rounded">
                          {g.tag}
                        </span>
                      </div>
                      <h3 className="font-title-lg text-title-lg text-on-surface mb-xs">{g.title}</h3>
                      <p className="text-on-surface-variant text-body-md mb-md">{g.desc}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex -space-x-2">
                          <Avatar name="A B" className="w-8 h-8 rounded-full border-2 border-surface-container text-[10px]" />
                          <Avatar name="C D" className="w-8 h-8 rounded-full border-2 border-surface-container text-[10px]" />
                          <div className="w-8 h-8 rounded-full border-2 border-surface-container bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-on-surface">
                            {g.members}
                          </div>
                        </div>
                        <span className="font-technical-mono text-technical-mono text-on-surface-variant">{g.active}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Tips & Recetas */}
              <section>
                <div className="flex justify-between items-end mb-md">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Tips Técnicos &amp; Recetas</h2>
                  <button className="font-technical-mono text-technical-mono uppercase text-primary hover:underline">Explorar todo</button>
                </div>
                <div className="flex gap-md overflow-x-auto pb-md scrollbar-hide">
                  {TIPS.map((t) => (
                    <div
                      key={t.title}
                      className={`min-w-[280px] flex-shrink-0 bg-surface-container-low border border-outline-variant rounded-xl p-md relative overflow-hidden group ${t.hover} transition-colors cursor-pointer`}
                    >
                      <div className="absolute inset-0 topo-bg opacity-10 pointer-events-none" />
                      <div className="relative z-10">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-lg mb-sm border ${t.wrap}`}>
                          <Icon name={t.icon} className={t.iconColor} />
                        </div>
                        <h4 className="font-title-lg text-[18px] text-on-surface mb-xs leading-tight group-hover:text-primary transition-colors">
                          {t.title}
                        </h4>
                        <p className="text-body-md text-on-surface-variant text-sm line-clamp-2">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Feed */}
              <section className="space-y-md">
                <div className="flex items-center gap-md border-b border-outline-variant pb-xs mb-lg">
                  <button className="font-technical-mono text-technical-mono uppercase text-primary border-b-2 border-primary pb-sm">Reciente</button>
                  <button className="font-technical-mono text-technical-mono uppercase text-on-surface-variant pb-sm hover:text-on-surface transition-colors">Tendencias</button>
                  <button className="font-technical-mono text-technical-mono uppercase text-on-surface-variant pb-sm hover:text-on-surface transition-colors">Técnico</button>
                </div>

                {/* Post 1 */}
                <article className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden">
                  <div className="p-md flex gap-md">
                    <Avatar name="Erik Jorgensen" className="w-12 h-12 rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-xs gap-2">
                        <div>
                          <h4 className="font-title-lg text-title-lg text-on-surface leading-none mb-xs">Erik &ldquo;Iceman&rdquo; Jørgensen</h4>
                          <span className="font-technical-mono text-[10px] text-on-surface-variant uppercase">Especialista Glaciares | @erik_exp</span>
                        </div>
                        <span className="font-technical-mono text-technical-mono text-on-surface-variant whitespace-nowrap">4h ago</span>
                      </div>
                      <p className="text-body-md text-on-surface-variant mb-md leading-relaxed">
                        Reseña rápida: acabo de probar la nueva carcasa técnica en la ascensión al Pico Sur. El aislamiento
                        térmico es excelente, pero el sistema de ventilación lateral requiere guantes más finos. ¿Alguien
                        más ha notado rigidez en las cremalleras a -15°C?
                      </p>
                      <div className="aspect-video w-full rounded-lg overflow-hidden border border-outline-variant mb-md bg-topo" />
                      <div className="flex items-center gap-lg">
                        <button className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors">
                          <Icon name="thumb_up" className="text-[20px]" />
                          <span className="font-technical-mono text-technical-mono">124</span>
                        </button>
                        <button className="flex items-center gap-xs text-on-surface-variant hover:text-secondary transition-colors">
                          <Icon name="chat_bubble" className="text-[20px]" />
                          <span className="font-technical-mono text-technical-mono">18</span>
                        </button>
                        <button className="flex items-center gap-xs text-on-surface-variant hover:text-on-surface transition-colors">
                          <Icon name="share" className="text-[20px]" />
                          <span className="font-technical-mono text-technical-mono">Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>

                {/* Post 2 */}
                <article className="bg-surface-container-low border border-outline-variant rounded-xl p-md flex gap-md">
                  <Avatar name="Mara Silva" className="w-12 h-12 rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-xs gap-2">
                      <div>
                        <h4 className="font-title-lg text-title-lg text-on-surface leading-none mb-xs">Mara Silva</h4>
                        <span className="font-technical-mono text-[10px] text-on-surface-variant uppercase">Planificadora de Rutas</span>
                      </div>
                      <span className="font-technical-mono text-technical-mono text-on-surface-variant whitespace-nowrap">8h ago</span>
                    </div>
                    <div className="bg-surface-variant/30 p-md rounded-lg mb-md border border-outline-variant">
                      <span className="font-technical-mono text-[10px] text-tertiary mb-xs block uppercase">TECHNICAL_QUESTION</span>
                      <p className="text-body-md text-on-surface font-medium italic">
                        &ldquo;¿Alguien tiene el track GPX actualizado del paso de &lsquo;Los Quebrantahuesos&rsquo;? He oído
                        que hubo un desprendimiento leve la semana pasada.&rdquo;
                      </p>
                    </div>
                    <button className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors">
                      <Icon name="forum" className="text-[20px]" />
                      <span className="font-technical-mono text-technical-mono">5 Respuestas</span>
                    </button>
                  </div>
                </article>
              </section>
            </div>

            {/* Right sidebar */}
            <aside className="col-span-12 lg:col-span-4 space-y-xl">
              {/* Trekker del Mes */}
              <div className="bg-surface-container-highest border border-outline-variant rounded-xl p-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-1 bg-primary" />
                <h2 className="font-technical-mono text-technical-mono text-on-surface-variant uppercase mb-md tracking-widest">Trekker del Mes</h2>
                <div className="text-center">
                  <div className="relative inline-block mb-md">
                    <div className="w-24 h-24 rounded-full border-2 border-primary p-1">
                      <Avatar name="Sam O'Connell" className="w-full h-full rounded-full text-xl" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-primary text-on-primary rounded-full p-1">
                      <Icon name="star" filled className="text-[16px]" />
                    </div>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs">Sam O&rsquo;Connell</h3>
                  <p className="font-technical-mono text-[10px] text-primary uppercase mb-md">Ascensiones: 42 | Rescate Voluntario</p>
                  <div className="grid grid-cols-2 gap-sm text-left bg-background/50 p-sm rounded border border-outline-variant">
                    <div>
                      <p className="font-technical-mono text-[10px] text-on-surface-variant uppercase">Km este mes</p>
                      <p className="font-title-lg text-title-lg text-on-surface">248.5</p>
                    </div>
                    <div>
                      <p className="font-technical-mono text-[10px] text-on-surface-variant uppercase">Elevación (m)</p>
                      <p className="font-title-lg text-title-lg text-on-surface">12,400</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expediciones */}
              <div className="space-y-md">
                <div className="flex items-center justify-between border-b border-outline-variant pb-xs">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Expediciones</h2>
                  <Icon name="calendar_month" className="text-on-surface-variant" />
                </div>
                {EVENTS.map((e) => (
                  <div
                    key={e.title}
                    className="flex gap-md group cursor-pointer border-b border-outline-variant pb-md hover:border-secondary transition-all"
                  >
                    <div className="bg-surface-container-high w-16 h-16 flex-shrink-0 flex flex-col items-center justify-center border border-outline-variant rounded">
                      <span className="font-technical-mono text-technical-mono text-secondary">{e.month}</span>
                      <span className="font-headline-sm text-headline-sm text-on-surface leading-none">{e.day}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-title-lg text-title-lg text-on-surface group-hover:text-secondary transition-colors">{e.title}</h4>
                      <div className="flex items-center gap-xs text-on-surface-variant mt-xs">
                        <Icon name={e.icon} className="text-[14px]" />
                        <span className="font-technical-mono text-[10px] uppercase">{e.place}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actividad Global */}
              <div className="bg-surface-variant/20 p-md border border-outline-variant rounded-xl">
                <h4 className="font-technical-mono text-technical-mono text-on-surface-variant uppercase mb-md">Actividad Global</h4>
                <div className="h-32 flex items-end justify-between gap-xs px-xs">
                  {BARS.map((h, i) => (
                    <div key={i} className={`w-full bg-primary/20 hover:bg-primary ${h} transition-all rounded-t-sm`} />
                  ))}
                </div>
                <p className="font-technical-mono text-[10px] text-center text-on-surface-variant mt-sm">
                  Frecuencia de expediciones registradas
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
