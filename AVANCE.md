# AVANCE — hAIke

> **Documento vivo y editable.** Se actualiza al cierre de cada cambio importante.
> Complementa a [FRONTEND_REDISENO.md](FRONTEND_REDISENO.md), que documenta el sistema de diseño y las pantallas.

**Última actualización**: 16 de agosto de 2026
**Estado del build**: ✅ `npm run build` OK · `npx tsc --noEmit` sin errores · 11 rutas generadas
**Bloqueador activo**: 🔴 `GEMINI_API_KEY` inválida — el Planificador no puede generar planes (ver más abajo)

---

## 🧭 Principio de arquitectura

> **hAIke planifica, no mide.**
> Ningún dato técnico de una ruta se calcula dentro de la app: todos provienen de una fuente
> que ya los publica. Si la fuente no declara un dato, la UI lo omite en vez de estimarlo.

Este principio se fijó el 16 de agosto de 2026 y motivó reescribir la capa de datos (ver Iteración 2).

---

## 📊 Estado del roadmap

| # | Paso | Estado | Notas |
|---|------|--------|-------|
| 1 | Conectar Gear al Planner | ✅ **Hecho** | `/gear` se arma desde los 3 checklists del TrekPlan |
| 2 | Conectar Weather al Planner | ✅ **Hecho** | `/weather` usa el pronóstico de las coordenadas de la ruta |
| 3 | My Routes con datos reales | ✅ **Hecho** | 500+ rutas de Wikiexplora, ficha técnica declarada |
| 5 | Persistencia del Plan | 🟡 **Parcial** | Persiste en `localStorage`; falta DB real |
| 4 | Comunidad con DB | ⬜ Pendiente | Requiere decidir backend |

---

## ✅ Lo realizado

### Iteración 2 — Datos de fuente documentada (16 ago 2026)

**Motivo del cambio**: la iteración anterior calculaba distancia (haversine), desnivel (modelo de
elevación SRTM) y dificultad (fórmula propia) sobre geometrías de OpenStreetMap. Se decidió que eso
contradice el propósito de la app. La comparación que lo dejó claro:

| Cerro La Campana | Calculado por hAIke | Declarado por Wikiexplora |
|---|---|---|
| Distancia | 3.33 km | **12.58 km** |
| Desnivel | +749 m | **+1538 m** |
| Dificultad | "hard" (fórmula) | **"Muy Fácil"** (curado) |

hAIke medía un fragmento arbitrario de sendero en OSM, no el trek que la gente realmente hace.

**Cobertura de datos, medida sobre una muestra real:**

| Campo | Wikiexplora | OSM |
|---|---|---|
| Duración | **100%** | 0% |
| Estado del sendero / señalización | **100%** | — |
| Distancia | **97%** | 32% |
| Desnivel de ascenso | **86%** | 4% |
| Dificultad técnica | 36% | 4% |

**Archivos nuevos**

| Archivo | Qué hace |
|---------|----------|
| [src/lib/wikiexplora/index.ts](src/lib/wikiexplora/index.ts) | Cliente de la **API oficial de MediaWiki** de Wikiexplora (no scraping de HTML). Parsea la plantilla `{{RutaForm2}}` respetando anidamiento de plantillas y enlaces. Caché de 24h y User-Agent identificable. |
| [src/lib/geocoding/index.ts](src/lib/geocoding/index.ts) | `geocodeLocation()` vía Nominatim. Es una consulta, no una medición: solo ubica la ruta para pedir el clima cuando la ficha no declara coordenadas. |
| [src/app/api/routes/route.ts](src/app/api/routes/route.ts) | `GET /api/routes?q=` — búsqueda de rutas documentadas. |

**Archivos eliminados**

- `src/lib/overpass/` — búsqueda en OSM y cálculo de distancia, desnivel y dificultad.
- `src/lib/elevation/` — desnivel derivado del modelo de elevación de Open-Meteo.
- `src/app/api/trails/` — reemplazado por `/api/routes`.
- Regla de Naismith en `src/lib/ai/` — estimaba el tiempo; ahora se usa la duración declarada.

**Archivos modificados**

- [src/types/index.ts](src/types/index.ts) — `Trail` → `Route`, con **todos los campos técnicos opcionales** (la fuente no siempre los declara). `TrekPlan.trail` → `TrekPlan.route`; se quitaron `difficulty_label`, `estimated_time_hours` y `estimated_time_display` por ser calculados.
- [src/app/api/plan/route.ts](src/app/api/plan/route.ts) — nuevo flujo: extraer destino → buscar ficha documentada → clima en sus coordenadas → checklists con IA.
- [src/lib/ai/index.ts](src/lib/ai/index.ts) — el prompt describe solo los campos declarados y ordena al modelo no recalcular ni inventar cifras.
- [src/app/routes/page.tsx](src/app/routes/page.tsx) — búsqueda contra la fuente, con esqueletos de carga y estados de error/vacío.
- [src/app/routes/[id]/page.tsx](src/app/routes/[id]/page.tsx) — ficha técnica que omite los campos no declarados, más sección de atribución con enlace a la ficha original.
- [src/components/RouteCard.tsx](src/components/RouteCard.tsx) — tarjeta sobre `RouteSummary`; la dificultad se muestra como etiqueta de la fuente, no como enum propio.
- [src/components/PlanView.tsx](src/components/PlanView.tsx), [planner](src/app/planner/page.tsx), [weather](src/app/weather/page.tsx), [gear](src/app/gear/page.tsx) — adaptados a campos opcionales.
- [src/lib/gearWeights.ts](src/lib/gearWeights.ts) — el peso recomendado ahora se deriva de la **duración declarada**, no de horas estimadas.
- [src/lib/sampleData.ts](src/lib/sampleData.ts) — las rutas destacadas son punteros a fichas reales; se eliminaron las estadísticas de usuario inventadas (12 rutas, 450 km) porque no existe sistema de usuarios.

**Legalidad y uso responsable** (relevante para la defensa del proyecto):

- Se **descartaron Wikiloc y AllTrails**: sus términos prohíben la extracción automatizada y tienen protección anti-bot.
- Wikiexplora expone `api.php` público (MediaWiki 1.26) — se usa la vía oficial, no scraping de HTML.
- Su `robots.txt` declara `Content-Signal: search=yes, ai-train=no, use=reference`. hAIke **referencia y atribuye**, no entrena modelos.
- ⚠️ Ese mismo `robots.txt` bloquea a los crawlers de IA (`ClaudeBot`, `GPTBot`, `CCBot`, `Google-Extended`). hAIke no es uno de ellos —`User-agent: *` tiene `Allow: /`— pero conviene tenerlo presente.
- Mitigaciones aplicadas: caché de 24h, User-Agent identificable, se muestran **datos** (no se copia prosa) y cada ficha enlaza a la original.

### Iteración 2b — Corrección de la búsqueda de rutas (16 ago 2026)

Al integrar Wikiexplora quedaron tres bugs que solo aparecen con consultas reales. `/api/plan`
devolvía `404` incluso para rutas que sí existen.

| Bug | Causa | Corrección |
|---|---|---|
| `" Chile"` añadido al destino | Servía para geocodificar con Nominatim, pero la búsqueda de la wiki exige que **todos** los términos aparezcan, y "Chile" dejaba la consulta en cero resultados | Se eliminó el sufijo; `geocodeLocation()` ya restringe por `countrycodes` |
| `"salto"` → `"s to"` | La regex de limpieza no tenía límites de palabra: `al` se borraba **dentro** de los nombres | Filtrado por palabra completa con lista de *stopwords* ([src/lib/ai/index.ts](src/lib/ai/index.ts)) |
| `"volcan villarrica"` → 0 resultados | La búsqueda distingue acentos | Diccionario de tildes frecuentes en topónimos chilenos |

Además, un calificador de más anulaba la búsqueda (`"cerro la campana en olmue"` → 0). Se añadió
`findRoutes()` en [src/lib/wikiexplora/index.ts](src/lib/wikiexplora/index.ts), que prueba variantes
de la más específica a la más general recortando términos por la derecha, con y sin tildes.

**Verificado tras la corrección:**

| Consulta | Antes | Ahora |
|---|---|---|
| `cerro la campana en olmue` | 0 | Cerro La Campana |
| `volcan villarrica` | 0 | Parque Nacional Volcán Villarrica |
| `salto del apoquindo` | 0 | Salto del Apoquindo |

También se añadió `friendlyError()` en [src/app/api/plan/route.ts](src/app/api/plan/route.ts): los fallos
de infraestructura llegaban a la interfaz como un volcado crudo de JSON de la API de Gemini. Ahora el
detalle técnico queda en el log y el usuario recibe una instrucción accionable.

### Iteración 1 — Store global del TrekPlan (16 ago 2026)

El TrekPlan vivía solo en el estado local de `/planner` y se perdía al navegar.

- [src/lib/planStore.tsx](src/lib/planStore.tsx) — Context del plan activo persistido en `localStorage`, con formato versionado y flag `hydrated` para evitar parpadeos SSR/cliente.
- [src/lib/gearWeights.ts](src/lib/gearWeights.ts) — estima gramaje por nombre de ítem (~70 reglas), porque la IA devuelve nombres sin peso y la UI de `/gear` es peso-céntrica.
- `/gear` se arma desde los tres checklists del plan; los checks persisten.
- `/weather` pasó de estática a alimentada por `plan.weather`.

**Decisión de contenido**: `/weather` mostraba humedad, presión, visibilidad, espesor de nieve, riesgo
de aludes y radar de tormentas, todos con valores fijos en el código. Ninguno existe en el forecast de
Open-Meteo que consume la app, así que se eliminaron en vez de dejar cifras inventadas en una pantalla
de seguridad.

---

## 🔴 Bloqueador activo

**El proyecto de Google asociado a la `GEMINI_API_KEY` tiene el acceso denegado:**

```
403 PERMISSION_DENIED — "Your project has been denied access. Please contact support."
```

No es una clave mal copiada (eso daba `400 API_KEY_INVALID`): la clave se lee bien, pero Google
rechaza el proyecto. Causas habituales: región no soportada, proyecto marcado por el sistema
antifraude, o falta de facturación asociada.

Consecuencia: `/planner` no genera planes. La búsqueda de rutas (`/routes`) y las fichas
**sí funcionan**, porque no dependen de la IA.

**Qué probar, en orden:**
1. Crear la key desde una **cuenta Google distinta** en [AI Studio](https://aistudio.google.com) → *Get API Key*.
2. Crear un **proyecto nuevo** de Google Cloud y generar la key dentro de ese proyecto.
3. Si persiste, evaluar otro proveedor — la capa de IA está aislada en
   [src/lib/ai/index.ts](src/lib/ai/index.ts) y solo expone `extractDestination()` y `generateTrekPlan()`.

> `extractDestination()` tiene fallback sin IA (funciona igual), pero `generateTrekPlan()` no:
> sin acceso a la IA no hay checklists, que son el núcleo del plan.

---

## 🔜 Lo por realizar

### Prioridad alta

**1. Persistencia real del plan (completar paso 5)**
`localStorage` cubre un solo dispositivo. Falta elegir backend (hay una carpeta `db/` con `schema.sql` sin usar),
guardar el plan con un `id`, exponer `GET /api/plans` y ofrecer historial en vez de un único plan activo.

**2. Mejorar la selección de ruta en el Planner**
`findDocumentedRoute()` toma la primera ficha válida de la búsqueda. Cuando hay homónimos
(*Cerro La Campana* existe en Olmué, Maule y Talca), el usuario debería poder elegir.

### Prioridad media

**3. Ampliar fuentes de rutas**
Wikiexplora cubre Chile. Para otros países haría falta otra fuente. La capa está aislada en
`src/lib/wikiexplora/`, así que agregar una segunda fuente es implementar la misma interfaz
(`searchRoutes` / `getRoute`) y elegir según el país.

**4. Aprovechar campos aún no usados**
La ficha declara `KMLZ` (archivo KMZ con el track) y coordenadas de inicio/fin. Con eso se podría
dibujar el recorrido en un mapa — `mapbox-gl` y `react-map-gl` ya están instalados sin uso.

**5. Perfil de usuario real**
`/planner` manda `fitness_level: 'intermediate'` y `group_size: 2` hardcodeados. Falta pantalla de
perfil y persistencia; "Alex Trekker / Pro Member" del sidebar sigue siendo un placeholder.

**6. Ampliar el pronóstico**
Open-Meteo entrega más variables de las que se piden: `relative_humidity_2m`, `surface_pressure`,
`visibility`, `snow_depth` y pronóstico horario. Eso permitiría restituir con datos reales las tarjetas
que se quitaron de `/weather`.

### Prioridad baja

**7. Comunidad con DB (paso 4)** — depende de la decisión de backend del punto 1.

**8. Limpieza**
`lucide-react` sin uso. En la raíz quedan `stich.zip`, `haikevideo.mp4` duplicado (el real está en
`public/`) y las carpetas con nombre literal `{db,services,models}` y `{src`, residuos de comandos de
shell mal expandidos. La carpeta `hAIke/` es un clon vacío del repo remoto (ya en `.gitignore`).

---

## 🧪 Cómo verificar

```bash
rm -rf .next && npm run dev
```

**Funciona sin API key:**
1. `/routes` → buscar *"Cerro La Campana"* → aparecen las fichas reales.
2. Abrir una → ficha técnica con distancia, desnivel, duración, señalización y enlace a la fuente.
3. Comprobar que los campos que la fuente no declara simplemente **no aparecen** (no salen en blanco ni en cero).

**Requiere `GEMINI_API_KEY` válida:**
4. `/planner` → *"trekking al cerro La Campana"* → plan con checklists.
5. `/gear` → ítems del plan con pesos estimados; marcar algunos actualiza la barra de carga.
6. `/weather` → pronóstico de las coordenadas de la ruta.
7. Recargar el navegador → el plan y los ítems marcados siguen ahí.

---

## 📐 Convenciones a mantener

Además de las de `FRONTEND_REDISENO.md`:

- **No calcular datos de ruta.** Si la fuente no lo declara, se omite el campo.
- Campos técnicos de `Route` siempre opcionales; la UI debe manejar su ausencia.
- Nunca mostrar métricas que el backend no entrega: si el dato no existe, se quita la tarjeta.
- Toda fuente externa se aísla en `src/lib/<fuente>/` y se consume por su API oficial cuando existe.
- Atribuir siempre la fuente en la UI, con enlace a la ficha original.
- Estado compartido entre pantallas → context en `src/lib/`, no prop drilling ni URL params.
- Todo store persistido lleva `version`; si no coincide, se descarta en vez de renderizar datos parciales.
- Pantallas que dependen del plan: siempre con empty state y CTA al Planificador.
