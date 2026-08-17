# AVANCE — hAIke

> **Documento vivo y editable.** Se actualiza al cierre de cada cambio importante.
> Complementa a [FRONTEND_REDISENO.md](FRONTEND_REDISENO.md), que documenta el sistema de diseño y las 6 pantallas.

**Última actualización**: 16 de agosto de 2026
**Estado del build**: ✅ `npm run build` OK · `npx tsc --noEmit` sin errores · 10 rutas generadas

---

## 📊 Estado del roadmap

Los 5 "Próximos Pasos" que dejó definidos `FRONTEND_REDISENO.md`:

| # | Paso | Estado | Notas |
|---|------|--------|-------|
| 1 | Conectar Gear al Planner | ✅ **Hecho** | `/gear` se arma desde los 3 checklists del TrekPlan |
| 2 | Conectar Weather al Planner | ✅ **Hecho** | `/weather` muestra el forecast real de la ruta |
| 5 | Persistencia del Plan | 🟡 **Parcial** | Persiste en `localStorage`; falta DB real |
| 3 | My Routes desde OSM | ⬜ Pendiente | Requiere endpoint de búsqueda de senderos |
| 4 | Comunidad con DB | ⬜ Pendiente | Requiere decidir backend (Firestore u otro) |

---

## ✅ Lo realizado

### Iteración 1 — Store global del TrekPlan (16 ago 2026)

El cuello de botella era que el TrekPlan vivía sólo en el estado local de `/planner`: al navegar a
otra pantalla se perdía. Se resolvió con un store compartido, y eso desbloqueó los pasos 1, 2 y 5 de una vez.

**Archivos nuevos**

| Archivo | Qué hace |
|---------|----------|
| [src/lib/planStore.tsx](src/lib/planStore.tsx) | Context + provider del plan activo, persistido en `localStorage` (`haike-active-plan`). Expone `usePlan()` con `active`, `hydrated`, `checkedGear`, `savePlan`, `clearPlan`, `toggleGear`. Versiona el formato guardado y descarta datos viejos en vez de renderizarlos rotos. |
| [src/lib/gearWeights.ts](src/lib/gearWeights.ts) | Estima gramaje por nombre de ítem (~70 reglas en español). La IA devuelve nombres sin peso y la UI de `/gear` es peso-céntrica. Entiende litros de agua explícitos y multiplicadores tipo `x2`. También calcula el peso recomendado de mochila según duración. |

**Archivos modificados**

- [src/app/layout.tsx](src/app/layout.tsx) — envuelve la app en `<PlanProvider>`; favicon `logo2.jpg` vía `metadata.icons`.
- [src/app/planner/page.tsx](src/app/planner/page.tsx) — llama `savePlan()` cuando llega un plan; el sidebar rehidrata el último plan al volver a la página; los botones del sidebar apuntan a `/gear` y `/weather` y se deshabilitan si no hay plan.
- [src/app/gear/page.tsx](src/app/gear/page.tsx) — **reescrita**. Deriva las categorías (Equipo Técnico / Ropa / Comida) de `gear_checklist`, `clothing_checklist` y `food_checklist`. Muestra el `reason` de cada ítem y un badge de prioridad. Los checks persisten. Sin plan cargado muestra la lista de ejemplo con un banner que invita a generar uno.
- [src/app/weather/page.tsx](src/app/weather/page.tsx) — **reescrita**. Pasó de server component estático a client component alimentado por `plan.weather`: temperaturas, viento, ráfagas, UV, precipitación (con semáforo de color), amanecer/atardecer, perfil de ruta y tips. Sin plan muestra un empty state con CTA al Planificador.

**Decisión de contenido**: la versión anterior de `/weather` mostraba humedad, presión, visibilidad, espesor
de nieve, riesgo de aludes y un radar de tormentas. Ninguno de esos datos existe en el forecast de Open-Meteo
que consume la app, así que se eliminaron en lugar de dejar números inventados en una pantalla de seguridad.
Si se quieren de vuelta, hay que ampliar la query en [src/lib/weather/index.ts](src/lib/weather/index.ts)
(ver pendiente 2.b más abajo).

---

## 🔜 Lo por realizar

### Prioridad alta

**1. Persistencia real del plan (completar paso 5)**
`localStorage` cubre un solo dispositivo y se pierde al limpiar el navegador. Falta:
- Elegir backend (hay una carpeta `db/` sin usar).
- Guardar el TrekPlan con un `id` y exponer `GET /api/plans` + `GET /api/plans/[id]`.
- Historial de planes en vez de un único plan activo.

**2. My Routes desde OSM (paso 3)**
- `src/lib/overpass` ya sabe buscar senderos; falta exponerlo como endpoint `GET /api/trails?lat=&lon=`.
- Reemplazar `SAMPLE_ROUTES` en [src/lib/sampleData.ts](src/lib/sampleData.ts) por resultados reales.
- `/routes/[id]` debería resolver el sendero por `osm_id`.
- Añadir paginación y estado de carga.

### Prioridad media

**2.b Ampliar el forecast**
Open-Meteo entrega más variables de las que se piden hoy. Añadir a la query `daily`/`hourly`:
`relative_humidity_2m`, `surface_pressure`, `visibility`, `snow_depth`, y pronóstico horario.
Eso permitiría restituir las tarjetas que se quitaron de `/weather` con datos reales.

**3. Peso del equipaje más preciso**
`gearWeights.ts` es heurístico. Alternativa: pedirle a Gemini el gramaje dentro de cada `ChecklistItem`
(añadir `grams` al tipo en [src/types/index.ts](src/types/index.ts) y al prompt de
[src/lib/ai/index.ts](src/lib/ai/index.ts)). Requiere validar que el modelo no devuelva valores absurdos.

**4. Perfil de usuario real**
Hoy `/planner` manda `fitness_level: 'intermediate'` y `group_size: 2` hardcodeados
([src/app/planner/page.tsx](src/app/planner/page.tsx)). Falta pantalla de perfil + persistencia,
y que "Alex Trekker / Pro Member" del sidebar deje de ser un placeholder.

### Prioridad baja

**5. Comunidad con DB (paso 4)** — depende de la decisión de backend del punto 1.

**6. Selección de sendero**
`/api/plan` toma siempre `trails[0]` de Overpass ([src/app/api/plan/route.ts:72](src/app/api/plan/route.ts#L72)).
Cuando hay varios senderos cercanos, el usuario debería poder elegir.

**7. Limpieza de dependencias**
`lucide-react`, `mapbox-gl` y `react-map-gl` están instalados pero sin uso. O se usan para el mapa
de `/routes`, o se sacan del `package.json`.

**8. Archivos sueltos en la raíz**
`stich.zip`, `haikevideo.mp4` (duplicado en `public/`) y las carpetas con nombre literal
`{db,services,models}` y `{src` son residuos de comandos de shell mal expandidos.

---

## 🧪 Cómo verificar lo hecho

```bash
rm -rf .next && npm run dev
```

1. Ir a `/planner` y pedir por ejemplo *"trekking al cerro La Campana este sábado"*.
2. Esperar el plan → aparece en el chat y en el sidebar "Itinerario Activo".
3. Click en **"Ver lista de equipaje"** → `/gear` muestra los ítems del plan con pesos y razones.
4. Marcar algunos ítems → la barra de carga se actualiza.
5. Ir a `/weather` → pronóstico real de las coordenadas de la ruta.
6. **Recargar el navegador** → el plan y los ítems marcados siguen ahí.

> Requiere `GEMINI_API_KEY` en `.env.local`.

---

## 📐 Convenciones a mantener

Además de las de `FRONTEND_REDISENO.md`:

- Estado compartido entre pantallas → context en `src/lib/`, no prop drilling ni URL params.
- Todo store persistido lleva `version`; si no coincide, se descarta en vez de renderizar datos parciales.
- Nunca mostrar métricas que el backend no entrega: si el dato no existe, se quita la tarjeta.
- Pantallas que dependen del plan: siempre con empty state y CTA al Planificador.
- `hydrated` del store evita parpadeos entre SSR y cliente — usarlo antes de decidir qué renderizar.
