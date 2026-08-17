'use client'

import { useEffect, useState } from 'react'
import { Icon } from './Icon'

type Theme = 'dark' | 'light'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTheme(document.documentElement.classList.contains('light') ? 'light' : 'dark')
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(next)
    try {
      localStorage.setItem('haike-theme', next)
    } catch {
      /* ignore */
    }
    setTheme(next)
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'}
      title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
      className="text-on-surface-variant hover:text-primary transition-all active:scale-90 p-2 rounded-full hover:bg-surface-container-high"
    >
      {/* Antes de montar mostramos el icono por defecto (oscuro) para evitar parpadeo de hidratación */}
      <Icon name={mounted && theme === 'light' ? 'dark_mode' : 'light_mode'} />
    </button>
  )
}
