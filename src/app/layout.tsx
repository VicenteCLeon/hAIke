import type { Metadata, Viewport } from 'next'
import './globals.css'
import { VideoSplash } from '@/components/VideoSplash'
import { PlanProvider } from '@/lib/planStore'

export const metadata: Metadata = {
  title: 'hAIke',
  description: 'Planifica tu próxima expedición con IA.',
  icons: {
    icon: '/logo2.jpg',
    shortcut: '/logo2.jpg',
    apple: '/logo2.jpg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#101412',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('haike-theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');}}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="bg-background text-on-background font-body-md min-h-screen">
        <VideoSplash />
        <PlanProvider>{children}</PlanProvider>
      </body>
    </html>
  )
}
