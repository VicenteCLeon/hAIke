'use client'

import { useEffect, useRef, useState } from 'react'

export function VideoSplash() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem('haike-splash-seen')
    if (!seen) {
      setVisible(true)
      sessionStorage.setItem('haike-splash-seen', '1')
    }
  }, [])

  function dismiss() {
    setFading(true)
    setTimeout(() => setVisible(false), 600)
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      style={{
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.6s ease',
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      <video
        ref={videoRef}
        src="/haikevideo.mp4"
        autoPlay
        muted
        playsInline
        onEnded={dismiss}
        className="w-full h-full object-cover"
      />

      {/* Logo overlay */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <span
          className="text-white font-serif text-3xl tracking-tight"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          hAIke
        </span>
      </div>

      {/* Skip button */}
      <button
        onClick={dismiss}
        className="absolute bottom-10 right-10 px-5 py-2.5 rounded-full border border-white/40 bg-black/40 text-white/80 text-sm hover:bg-white/10 hover:border-white/70 transition-all backdrop-blur-sm"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Saltar intro →
      </button>
    </div>
  )
}
