# hAIke 🏔️

Plataforma de planificación inteligente para trekking.  
Cruza datos de senderos (OSM), clima (Open-Meteo) y tu perfil físico para generar un plan personalizado con IA (Claude).

## Stack

| Capa | Tecnología |
|---|---|
| Frontend / PWA | Next.js 15 + TypeScript + Tailwind |
| IA | Anthropic Claude API |
| Senderos | OpenStreetMap + Overpass API |
| Geocoding | Nominatim (OSM) |
| Clima | Open-Meteo |
| Base de datos | PostgreSQL + PostGIS (próxima iteración) |
| Deploy frontend | Vercel |

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local y agrega tu ANTHROPIC_API_KEY

# 3. Correr en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Flujo de la app

```
Usuario escribe consulta
  → Claude extrae destino
  → Nominatim geocodifica
  → Overpass busca senderos OSM
  → Open-Meteo obtiene clima
  → Claude genera plan (checklist + tiempo + tips)
  → UI muestra tarjetas
```

## Estructura del proyecto

```
src/
├── app/
│   ├── api/plan/route.ts   # Endpoint principal
│   └── page.tsx            # UI principal
├── lib/
│   ├── overpass/           # Senderos desde OSM
│   ├── weather/            # Clima desde Open-Meteo
│   └── ai/                 # Claude: extracción + generación
└── types/                  # Tipos TypeScript compartidos
```

## Próximos pasos

- [ ] Persistencia con PostgreSQL + PostGIS
- [ ] Perfil de usuario con historial de trekkings
- [ ] Mapa interactivo con Mapbox GL
- [ ] Plan de entrenamiento preparatorio
- [ ] PWA offline con Service Worker
