'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Icon } from './Icon'

export function AISearchBar({ placeholder = 'Busca tu próxima expedición...' }: { placeholder?: string }) {
  const router = useRouter()
  const [value, setValue] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    if (!q) return
    router.push(`/planner?q=${encodeURIComponent(q)}`)
  }

  return (
    <form
      onSubmit={submit}
      className="w-full relative ai-pulse bg-surface-container-low rounded-xl border border-outline-variant transition-all duration-500"
    >
      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none">
        <Icon name="auto_awesome" className="text-primary" />
        <div className="w-2 h-2 rounded-full bg-primary micro-indicator" />
      </div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full bg-transparent border-none py-6 pl-20 pr-16 text-on-surface font-body-lg placeholder-on-surface-variant focus:ring-0 focus:outline-none"
        placeholder={placeholder}
        type="text"
      />
      <button
        type="submit"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-on-primary p-2 rounded-lg hover:bg-primary-fixed transition-colors"
      >
        <Icon name="arrow_forward" />
      </button>
    </form>
  )
}
