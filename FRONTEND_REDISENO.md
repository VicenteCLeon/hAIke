# Rediseño Frontend hAIke — Technical Organic

Documentación completa del rediseño del frontend de hAIke con el sistema de diseño **Technical Organic**, implementado con Next.js 15, Tailwind CSS y React.

---

## 📋 Resumen Ejecutivo

Se rediseñó completamente el frontend de hAIke (originalmente una interfaz conversacional simple) con un sistema de diseño profesional de **6 pantallas** tipo aplicación web moderna, inspirado en los mockups `stitch_haike_trekking_interface/`. Incluye:

- ✅ **Sistema de diseño completo** (colores, tipografía, espaciado, componentes)
- ✅ **6 pantallas funcionales** con navegación integrada
- ✅ **Planner conectado al backend real** `/api/plan`
- ✅ **Tema claro/oscuro** con cambio dinámico y persistencia
- ✅ **Responsive design** (sidebar desktop, bottom nav móvil)
- ✅ **Todas las páginas compiladas y sin errores**

---

## 🎨 Sistema de Diseño: Technical Organic

### Paleta de Colores

**Tema Oscuro** (por defecto):
- **Fondo/Surface**: Deep Moss `#101412` (RGB: 16 20 18)
- **Primario**: Leaf Green `#91d69d` (acentos, botones activos)
- **Secundario**: Stream Teal `#8dd3c9` (información, navegación)
- **Tertiary**: Lichen Orange `#ffb688` (alertas, warnings)
- **Texto sobre superficie**: Morning Mist `#dfe4de`
- **Bordes**: Outline `#8a9389`, Outline Variant `#404940`

**Tema Claro** (`.light`):
- **Fondo**: Blanco cálido `#F5F0E8` (RGB: 245 240 232)
- **Primario**: Verde oscuro `#2d6b3f`
- **Texto**: Gris muy oscuro `#1a1c19`
- **Tarjetas/Containers**: Tonos claros y casi blancos
- Acentos (secundario, tertiary) adaptados para contraste sobre blanco

### Tipografía

| Familia | Uso | Enlace |
|---------|-----|--------|
| **DM Serif Display** | Títulos grandes (display-lg, headlines) — editorial, elegante | [Google Fonts](https://fonts.google.com/specimen/DM+Serif+Display) |
| **DM Sans** | Body, botones, labels, interfaces — moderna, legible | [Google Fonts](https://fonts.google.com/specimen/DM+Sans) |
| **JetBrains Mono** | Datos técnicos, monoespaciada (coordenadas, distancias) | [Google Fonts](https://fonts.google.com/specimen/JetBrains+Mono) |
| **Material Symbols Outlined** | Iconografía (30+ iconos usados) | [Google Fonts](https://fonts.google.com/icons) |

**Escalas de texto**:
- `font-display-lg` / `text-display-lg`: 48px, headlines principales
- `font-headline-md` / `text-headline-md`: 32px, secciones
- `font-title-lg` / `text-title-lg`: 20px, subtítulos
- `font-body-md` / `text-body-md`: 16px, body copy
- `font-label-md` / `text-label-md`: 14px, etiquetas
- `font-technical-mono` / `text-technical-mono`: 12px, datos técnicos

### Espaciado (Base-8)

```
--base: 8px
--xs: 4px
--sm: 12px
--md: 24px
--lg: 48px
--xl: 80px
--gutter: 16px
--margin-mobile: 20px
--margin-desktop: 64px
```

### Rounded

```
--DEFAULT: 0.125rem (2px)
--sm: 0.125rem
--lg: 0.25rem (4px)
--xl: 0.5rem (8px)
--full: 9999px
```

---

## 🏗️ Estructura del Proyecto

```
e:\haike
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout + head (fuentes, script anti-flash)
│   │   ├── globals.css              # Tailwind directives + variables CSS (temas)
│   │   ├── page.tsx                 # Dashboard / Explore
│   │   ├── planner/
│   │   │   └── page.tsx             # Planner IA (conectado a /api/plan)
│   │   ├── routes/
│   │   │   ├── page.tsx             # My Routes (índice)
│   │   │   └── [id]/
│   │   │       └── page.tsx         # Ficha de ruta (detalle)
│   │   ├── gear/
│   │   │   └── page.tsx             # Lista de equipaje
│   │   ├── weather/
│   │   │   └── page.tsx             # Clima (bento grid)
│   │   ├── community/
│   │   │   └── page.tsx             # Comunidad (grupos, feed, sidebar)
│   │   └── api/plan/
│   │       └── route.ts             # Backend API (OSM, clima, IA)
│   ├── components/
│   │   ├── AppShell.tsx             # Sidebar + TopNav + BottomNav (chrome compartido)
│   │   ├── AISearchBar.tsx          # Search bar con pulso IA
│   │   ├── Icon.tsx                 # Material Symbols wrapper
│   │   ├── RouteCard.tsx            # Card reutilizable para rutas
│   │   ├── PlanView.tsx             # Display del TrekPlan (stats, checklists, etc.)
│   │   └── ThemeToggle.tsx          # Botón claro/oscuro + persistencia
│   ├── lib/
│   │   ├── sampleData.ts            # Datos de ejemplo (rutas, stats)
│   │   ├── ai/index.ts              # Claude API (extracción, generación)
│   │   ├── overpass/index.ts        # OpenStreetMap queries
│   │   └── weather/index.ts         # Open-Meteo API
│   └── types/
│       └── index.ts                 # TypeScript types (TrekPlan, Trail, etc.)
├── tailwind.config.js               # Config con colores CSS variables
├── postcss.config.js                # PostCSS + Tailwind (CRÍTICO para compilar)
├── next.config.ts                   # Next.js config
├── tsconfig.json
├── package.json
└── package-lock.json
```

---

## 🎯 Las 6 Pantallas

### 1. **Dashboard / Explore** (`/`)

**Descripción**: Página de inicio con stats del usuario, buscador IA y rutas recomendadas.

**Componentes clave**:
- Stats cards (completadas, km recorridos, próximo trek)
- AISearchBar con pulso y mini-sugerencias
- Grid de 3 rutas recomendadas (RouteCard)

**Datos**: 
- Stats: `SAMPLE_ROUTES` en `src/lib/sampleData.ts`
- Rutas de ejemplo: Fitz Roy Loop, Circuito O, Aconcagua Normal

**Estado de conexión**: Datos de ejemplo. Podría conectarse a una tabla de rutas guardadas en DB.

---

### 2. **Planner** (`/planner`)

**Descripción**: Chat conversacional donde el usuario describe su expedición y la IA genera un plan técnico completo.

**Componentes clave**:
- Chat bidireccional (user → assistant → error)
- Panel lateral "Itinerario Activo" que muestra el TrekPlan resultante
- PlanCard con ruta, clima, 3 checklists interactivos, tips

**Flujo**:
1. Usuario escribe destino o llega vía `/planner?q=...` desde el dashboard
2. POST a `/api/plan` con query + user profile
3. Backend (Claude + OSM + Open-Meteo) devuelve TrekPlan
4. Se renderiza el plan en el panel lateral

**Estado de conexión**: ✅ **Conectado al backend real** (`/api/plan`). El único flujo end-to-end completo.

---

### 3. **My Routes** (`/routes`) + **Ficha de Ruta** (`/routes/[id]`)

**Descripción**: 
- `/routes`: índice de rutas guardadas (3 ejemplos)
- `/routes/[id]`: detalle de una ruta con hero image, tabs, gráfico de elevación, sidebar de logística

**Componentes clave**:
- RouteCard (título, ubicación, dificultad, distancia, desnivel)
- DifficultyBadge (easy, moderate, hard con colores)
- Hero con backdrop, "Perfil de elevación" (SVG animado)
- Tabs (Overview, Itinerary, Gear List, Reviews)
- "hAIke Synthesis" (análisis agregado de reseñas)
- Sidebar sticky con botón "Planificar esta ruta" (navega a `/planner?q=...`)

**Datos**: Ejemplos en `src/lib/sampleData.ts`

**Estado de conexión**: Datos de ejemplo. Próximos pasos: OSM para buscar/detallar rutas, DB para rutas guardadas.

---

### 4. **Lista de Equipaje** (`/gear`)

**Descripción**: Gestión inteligente de carga. Checkboxes interactivos, toggle temporada (verano/invierno), indicador de peso vs. recomendado.

**Componentes clave**:
- Selector de temporada (botones toggle)
- Barra de progreso de carga (8.2 kg / Rec: 10 kg, 82%)
- Grid de categorías (Refugio, Ropa, Comida, etc.) con checkboxes
- Items con peso, icono de categoría, badge "Recomendado por hAIke IA"
- Alert técnico al pie

**Interactividad**:
- Click checkbox → línea tachada + opacidad baja
- Suma de pesos en tiempo real
- Color rojo si sobrepasa 100%

**Datos**: Arrays en `src/app/gear/page.tsx`

**Estado de conexión**: Datos de ejemplo. Ideal para conectar: generaría la lista desde el `TrekPlan.gear_checklist` del Planner.

---

### 5. **Clima** (`/weather`)

**Descripción**: Bento grid con condiciones actuales, alertas IA, mapa de radar, pronóstico por horas.

**Componentes clave**:
- Safety alerts (ventana de buen tiempo, alerta de ventisca)
- Condiciones actuales: -4°C con icono de nieve
- Grid de métricas (viento, visibilidad, humedad, presión)
- Card "Riesgo de Aludes" (nivel 3, descripción)
- Radar de tormentas (bg-topo con ping animate)
- Pronóstico horario (table con temps, precipitación %)
- "Actividad Global" (mini chart con 7 barras)

**Datos**: Ejemplos en `src/app/weather/page.tsx`

**Estado de conexión**: Datos de ejemplo. Conectar a Open-Meteo (ya existe `src/lib/weather/index.ts`).

---

### 6. **Comunidad** (`/community`)

**Descripción**: Hub social. Grupos destacados, tips técnicos, feed de actividad, trekker del mes, próximas expediciones.

**Componentes clave**:
- Grupos cards (icono, badge técnico, descripción, avatares miembros, último activo)
- Tips/Recetas carousel horizontal (scroll)
- Tabs de feed (Reciente, Tendencias, Técnico)
- Post con imagen, reacciones (👍, 💬, share)
- Pregunta técnica en card destacada
- Sidebar: "Trekker del Mes" (avatar grande, stats), "Expediciones" (calendar cards), "Actividad Global" (bar chart)

**Datos**: Ejemplos en `src/app/community/page.tsx`

**Estado de conexión**: Datos de ejemplo. Próximos pasos: post de verdad desde Firestore/DB, comentarios en tiempo real.

---

## 🔧 Arquitectura de Componentes

### AppShell (Navegación Compartida)

```tsx
<AppShell footer={true} topNav={true} noPadding={false}>
  {children}
</AppShell>
```

Renderiza:
- **Sidebar** (desktop fixed, 16rem)
  - Logo + "Tu próxima aventura te espera"
  - Nav items (6 enlaces) con icono + label
  - Highlight: borde derecho verde + fondo si está activo
  - Perfil del usuario (avatar círculo, nombre, "Pro Member")
- **TopNav** (sticky, 4rem)
  - Logo (mobile only)
  - ThemeToggle (sol/luna)
  - Notificaciones + Settings (placeholders)
- **BottomNav** (mobile fixed, 3rem)
  - 4 items principales (Explore, Routes, Planner, Gear)
  - Activo con background
- **Footer** (al pie, texto small)
  - Copyright + links (Privacy, Terms, Support, API)

### Icon Component

```tsx
<Icon name="explore" filled={active} className="text-primary" />
```

Wrapper de Material Symbols:
- Renderiza `<span class="material-symbols-outlined">{name}</span>`
- `filled` prop → `font-variation-settings: 'FILL' 1`
- Hereda color vía `className`

### ThemeToggle

```tsx
<ThemeToggle />
```

- Botón en TopNav (derecha, antes de notificaciones)
- Click: toggle entre `dark` ↔️ `light` en `<html>`
- Guarda en `localStorage('haike-theme')`
- Script anti-flash en `<head>` aplica tema antes de render
- Icono cambia: `light_mode` (tema oscuro actual) ↔️ `dark_mode` (tema claro actual)

---

## 🎨 Sistema de Temas (CSS Variables)

### Implementación

**tailwind.config.js**: Todos los colores usan `rgb(var(--token) / <alpha-value>)`

```javascript
primary: 'rgb(var(--primary) / <alpha-value>)',
'bg-primary/5': usa --primary con opacidad 5%
```

**globals.css**: Define variables bajo `:root` (oscuro) y `.light`

```css
:root, .dark {
  --surface: 16 20 18;
  --primary: 145 214 157;
  --on-surface: 223 228 222;
  /* etc. */
}

.light {
  --surface: 245 240 232;
  --primary: 44 107 63;
  --on-surface: 26 28 25;
  /* etc. */
}
```

### Cambio Dinámico

```javascript
// ThemeToggle.tsx
document.documentElement.classList.remove('light', 'dark')
document.documentElement.classList.add(next)
localStorage.setItem('haike-theme', next)
```

El cambio es **instantáneo** gracias a `transition: background-color 0.3s ease, color 0.3s ease` en `body`.

---

## 🐛 Problemas Encontrados y Solucionados

### 1. **Tailwind CSS no se compilaba** ❌ → ✅

**Síntoma**: Bundle CSS era 4KB, sin ninguna utilidad (`bg-surface`, `text-primary`, etc.). Todo se veía sin estilos.

**Causa**: Falta de `postcss.config.js`. Next.js no sabía que ejecutara Tailwind.

**Solución**: Crear `postcss.config.js`:
```javascript
module.exports = {
  plugins: { tailwindcss: {}, autoprefixer: {} }
}
```

**Resultado**: CSS pasó a 44KB con todas las utilidades generadas.

---

### 2. **Fuentes de Google no cargaban** ❌ → ✅

**Síntoma**: Material Symbols se veía como texto (`edit_note`, `map`, etc.) en lugar de iconos.

**Causa**: Los `@import` de fuentes estaban en `globals.css` **después** de `@tailwind`, violando la spec CSS (los `@import` deben ir antes de cualquier otra regla). El navegador los ignoraba.

**Solución**: Mover fuentes a `<link>` en el `<head>` de `layout.tsx`:
```tsx
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display..." />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined..." />
```

**Resultado**: Todas las fuentes cargan correctamente, iconos visibles.

---

### 3. **Procesos Node huérfanos bloqueaban puertos** ❌ → ✅

**Síntoma**: Al reiniciar dev server, los puertos 3000/3001/3002 estaban "en uso" aunque no había servidor corriendo.

**Causa**: Procesos `node` anteriores no terminaron correctamente.

**Solución**: Usar PowerShell para matar procesos en esos puertos:
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
```

---

### 4. **Parpadeo al cambiar tema** ❌ → ✅

**Síntoma**: Al recargar página con tema claro guardado, aparecía oscuro por 100ms, luego claro.

**Causa**: El script `ThemeToggle` (que aplica la clase `.light`) es React y solo corre después de la hidratación.

**Solución**: Inyectar script sincrónico en `<head>` que aplique el tema antes del primer render:
```tsx
<script dangerouslySetInnerHTML={{
  __html: `(function(){
    try{
      var t=localStorage.getItem('haike-theme');
      if(t==='light'){
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    }catch(e){}
  })();`
}} />
```

**Resultado**: Tema aplicado instant sin flash.

---

### 5. **Clases Tailwind dinámicas no compilaban** ❌ → ✅

**Síntoma**: En `community/page.tsx`, usé `className={text-${accent}}` esperando que Tailwind lo interpolara.

**Causa**: Tailwind JIT necesita strings literales para detectar clases. Interpolaciones con variables JS no compilan.

**Solución**: Pasar clases completas en el objeto:
```typescript
const TIPS = [
  { 
    icon: 'ac_unit', 
    wrap: 'bg-secondary-container/30 border-secondary/20',  // ← string literal
    iconColor: 'text-secondary',
    // ...
  }
]

// En JSX:
<div className={t.wrap}>
  <Icon className={t.iconColor} />
</div>
```

**Resultado**: Todas las clases compiladas correctamente.

---

## 📦 Dependencias Clave

```json
{
  "next": "15.1.0",
  "react": "^19.0.0",
  "tailwindcss": "^3.4.1",
  "postcss": "^8",
  "autoprefixer": "^10.0.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.6.0",
  "lucide-react": "^0.469.0",
  "zod": "^3.24.1"
}
```

**Nota**: `lucide-react` instalado pero NO usado (usamos Material Symbols de Google Fonts).

---

## 🚀 Cómo Correr Localmente

```bash
# Instalar dependencias
npm install

# Limpiar caché y levantar dev server (http://localhost:3000)
rm -rf .next
npm run dev

# Build para producción
npm run build
npm run start

# Typecheck
npx tsc --noEmit
```

---

## 📊 Estado de Conexión al Backend

| Pantalla | Datos | Conexión |
|----------|-------|----------|
| `/` Dashboard | 3 rutas ejemplo, stats usuario | Ejemplo (listo para DB) |
| `/planner` | TrekPlan en tiempo real | ✅ **CONECTADO** a `/api/plan` |
| `/routes` | 3 rutas ejemplo | Ejemplo (listo para OSM) |
| `/routes/[id]` | Detalles ruta estática | Ejemplo (listo para OSM) |
| `/gear` | Lista de equipaje estática | Ejemplo (ideal para TrekPlan) |
| `/weather` | Condiciones estáticas | Ejemplo (listo para Open-Meteo) |
| `/community` | Grupos/feed estáticos | Ejemplo (listo para DB/Firestore) |

---

## 🔮 Próximos Pasos (Recomendados)

1. **Conectar Gear al Planner**
   - Pasar `plan.gear_checklist` del TrekPlan a `/gear` vía state/URL
   - O guardar el TrekPlan en un context global

2. **Conectar Weather al Planner**
   - Pasar `plan.weather` a `/weather`
   - O llamar Open-Meteo nuevamente en `/weather` con coordenadas del trail

3. **My Routes desde OSM**
   - Usar `src/lib/overpass` para buscar senderos cercanos a las coordenadas del usuario
   - Paginar resultados

4. **Comunidad con DB**
   - Conectar Firestore (o la DB que usen) para posts, comentarios, grupos reales

5. **Persistencia del Plan**
   - Guardar TrekPlan en Firestore cuando el usuario lo genera
   - Poder recuperarlo desde "My Routes"

---

## 📝 Notas de Diseño

- **Modo oscuro por defecto**: mejor para exteriores, reduce fatiga ocular nocturna
- **Material Symbols Outlined**: 140+ iconos disponibles, consistente con Material Design 3
- **Base-8 spacing**: predecible, escala bien en responsive
- **Texto claro sobre oscuro**: alto contraste (WCAG AA ✓)
- **Textura `bg-topo`**: patrón visual de contorno topográfico, refuerza marca
- **Animaciones sutiles**: fade-in (0.4s), pulse (3s), smooth transitions (0.3s)

---

## 🎓 Estructura para Mantener

```
Mantener estos patrones:
✓ Componentes sin estado en src/components/
✓ Páginas en src/app/[route]/page.tsx (app router)
✓ Librerías externas (OSM, clima, IA) en src/lib/
✓ Tipos compartidos en src/types/index.ts
✓ Datos de ejemplo en src/lib/sampleData.ts
✓ CSS globales + variables en src/app/globals.css
```

---

## 📄 Archivos Creados/Modificados

### Creados
- `postcss.config.js` — **CRÍTICO** para compilar Tailwind
- `src/components/Icon.tsx` — Material Symbols wrapper
- `src/components/AppShell.tsx` — Chrome compartido
- `src/components/AISearchBar.tsx` — Búsqueda IA con pulso
- `src/components/RouteCard.tsx` — Card reutilizable
- `src/components/PlanView.tsx` — Display de TrekPlan
- `src/components/ThemeToggle.tsx` — Selector claro/oscuro
- `src/lib/sampleData.ts` — Datos de ejemplo
- `src/app/page.tsx` — Dashboard
- `src/app/planner/page.tsx` — Planner IA
- `src/app/routes/page.tsx` — Índice de rutas
- `src/app/routes/[id]/page.tsx` — Ficha de ruta
- `src/app/gear/page.tsx` — Lista de equipaje
- `src/app/weather/page.tsx` — Clima
- `src/app/community/page.tsx` — Comunidad

### Modificados
- `tailwind.config.js` — Tokens basados en CSS variables
- `src/app/layout.tsx` — Links de fuentes + script anti-flash
- `src/app/globals.css` — Variables CSS (temas oscuro/claro)

---

## 🏁 Checklist Final

- ✅ Sistema de diseño completo (colores, tipografía, espaciado)
- ✅ 6 pantallas funcionales
- ✅ Navegación sidebar + top/bottom nav
- ✅ Planner conectado a `/api/plan`
- ✅ Tema claro/oscuro con persistencia
- ✅ Todas las fuentes cargan correctamente
- ✅ Iconos visibles (Material Symbols)
- ✅ TypeScript sin errores
- ✅ Build sin errores
- ✅ Todas las rutas responden 200

---

## 📞 Soporte

Para cambios futuros:
- **Añadir pantalla**: copiar estructura en `src/app/[nombre]/page.tsx`, envolver con `<AppShell>`
- **Cambiar colores**: editar variables CSS en `globals.css` (`:root` o `.light`)
- **Cambiar fuentes**: actualizar `<link>` en `layout.tsx` y `tailwind.config.js`
- **Conectar datos reales**: reemplazar arrays en cada pantalla con llamadas a API/DB

---

**Última actualización**: 31 de mayo de 2026
**Estado**: ✅ Producción-listo (datos de ejemplo, backend Planner conectado)
