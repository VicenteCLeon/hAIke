'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { Icon } from './Icon'
import { ThemeToggle } from './ThemeToggle'

type NavItem = { href: string; label: string; icon: string }

const NAV: NavItem[] = [
  { href: '/', label: 'Explore', icon: 'explore' },
  { href: '/routes', label: 'My Routes', icon: 'map' },
  { href: '/planner', label: 'Planner', icon: 'edit_note' },
  { href: '/gear', label: 'Gear', icon: 'handyman' },
  { href: '/weather', label: 'Weather', icon: 'cloudy_snowing' },
  { href: '/community', label: 'Community', icon: 'groups' },
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <nav className="hidden md:flex flex-col h-screen fixed left-0 top-0 py-base bg-surface border-r border-outline-variant w-64 z-50">
      <div className="px-6 py-8 flex flex-col items-start border-b border-outline-variant mb-6">
        <span className="font-headline-md text-headline-md text-primary italic mb-2">hAIke</span>
        <span className="font-label-md text-label-md text-on-surface-variant">Tu próxima aventura te espera!</span>
      </div>
      <ul className="flex flex-col flex-grow px-4 gap-2">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={clsx(
                  'flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-200 ease-in-out',
                  active
                    ? 'text-primary font-bold border-r-2 border-primary bg-surface-container-high'
                    : 'text-on-surface-variant font-medium hover:bg-surface-container-high hover:text-primary',
                )}
              >
                <Icon name={item.icon} filled={active} />
                <span className="font-body-md">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
      <div className="mt-auto px-6 py-4 flex items-center gap-4 border-t border-outline-variant">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center border border-primary-fixed flex-shrink-0">
          <Icon name="person" filled className="text-on-primary-container" />
        </div>
        <div className="flex flex-col">
          <span className="font-label-md text-label-md text-on-surface">Alex Trekker</span>
          <span className="font-label-caps text-label-caps text-primary">Pro Member</span>
        </div>
      </div>
    </nav>
  )
}

function TopNav() {
  return (
    <header className="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop bg-surface border-b border-outline-variant sticky top-0 w-full z-40">
      <span className="font-headline-md text-headline-md text-primary italic md:hidden">hAIke</span>
      <div className="flex items-center gap-4 w-full justify-end">
        <ThemeToggle />
        <button className="text-on-surface-variant hover:text-primary transition-all active:scale-90 p-2 rounded-full hover:bg-surface-container-high">
          <Icon name="notifications" />
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-all active:scale-90 p-2 rounded-full hover:bg-surface-container-high">
          <Icon name="settings" />
        </button>
      </div>
    </header>
  )
}

function BottomNav({ pathname }: { pathname: string }) {
  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-surface-container-lowest border-t border-outline-variant z-50 px-2 py-3 flex justify-around items-center">
      {NAV.slice(0, 4).map((item) => {
        const active = isActive(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex flex-col items-center gap-1 p-2 transition-colors',
              active ? 'text-primary' : 'text-on-surface-variant hover:text-primary',
            )}
          >
            <Icon name={item.icon} filled={active} className="text-2xl" />
            <span className="font-label-caps text-label-caps text-[10px]">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function Footer() {
  return (
    <footer className="mt-auto flex flex-col md:flex-row justify-between items-center gap-4 py-6 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest border-t border-outline-variant w-full">
      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
        © 2024 hAIke Technical Outdoor Systems
      </span>
      <ul className="flex gap-6">
        {['Privacy', 'Terms', 'Support', 'API'].map((l) => (
          <li key={l}>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  )
}

/**
 * Shared application chrome: fixed sidebar (desktop), sticky top bar, and a
 * bottom tab bar on mobile. Pages render inside the scrollable main canvas.
 */
export function AppShell({
  children,
  topNav = true,
  footer = true,
  noPadding = false,
}: {
  children: React.ReactNode
  topNav?: boolean
  footer?: boolean
  noPadding?: boolean
}) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar pathname={pathname} />
      <div className="flex-1 md:ml-64 min-h-screen flex flex-col w-full md:w-[calc(100%-16rem)]">
        {topNav && <TopNav />}
        <main className={clsx('flex-grow flex flex-col w-full', !noPadding && 'pb-24 md:pb-0')}>
          {children}
        </main>
        {footer && <Footer />}
      </div>
      <BottomNav pathname={pathname} />
    </div>
  )
}
