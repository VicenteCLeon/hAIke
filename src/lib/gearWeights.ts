// src/lib/gearWeights.ts
// Estima el peso de un ítem de equipaje a partir de su nombre.
//
// El TrekPlan que devuelve la IA trae nombres de ítems pero no gramajes, y la
// pantalla /gear se apoya en el peso para la barra de carga. Estas estimaciones
// son valores de referencia de equipo estándar, no medidas exactas.

/** Pares [patrón, gramos]. El primero que coincida gana, así que van de específico a genérico. */
const WEIGHT_RULES: [RegExp, number][] = [
  // ─── Agua e hidratación (lo más pesado de una mochila de día) ──
  [/vejiga|camelbak|bladder/i, 3100],
  [/(\d+(?:[.,]\d+)?)\s*(?:l|lt|litros?)\s*(?:de\s*)?agua/i, 0], // manejado aparte
  [/botella.*agua|agua.*botella|cantimplora/i, 1000],
  [/agua/i, 2000],
  [/filtro|purificador|potabilizador/i, 320],

  // ─── Refugio y dormir ──────────────────────────────────────────
  [/carpa|tienda/i, 1800],
  [/saco de dormir|sleeping/i, 1200],
  [/esterilla|aislante|colchoneta/i, 450],
  [/manta térmica|manta de emergencia/i, 60],

  // ─── Ropa ──────────────────────────────────────────────────────
  [/primera capa|capa base|merino|térmic[ao]/i, 200],
  [/cortavientos|rompeviento/i, 250],
  [/impermeable|hardshell|gore-?tex|chubasquero|poncho/i, 350],
  [/pluma|plumón|down|micropolar|polar|fleece/i, 400],
  [/chaqueta|casaca|abrigo/i, 500],
  [/pantal[óo]n/i, 320],
  [/calcetines|medias/i, 80],
  [/guantes/i, 100],
  [/gorro|beanie|cuello|buff/i, 70],
  [/jockey|gorra|sombrero/i, 90],
  [/botas|zapatillas|calzado/i, 1100],
  [/polainas/i, 200],
  [/lentes|gafas|anteojos/i, 30],

  // ─── Navegación y seguridad ────────────────────────────────────
  [/gps|garmin|inreach/i, 200],
  [/br[úu]jula/i, 40],
  [/mapa|carta topogr[áa]fica/i, 50],
  [/frontal|linterna|headlamp/i, 90],
  [/botiqu[íi]n|primeros auxilios/i, 300],
  [/silbato|pito/i, 15],
  [/navaja|cuchillo|multiherramienta|multitool/i, 120],
  [/bastones|bastón|trekking poles/i, 500],
  [/casco/i, 350],
  [/arn[ée]s/i, 400],
  [/crampones/i, 900],
  [/piolet/i, 500],
  [/cuerda/i, 2000],
  [/bater[íi]a|power ?bank|cargador/i, 250],
  [/celular|tel[ée]fono/i, 200],
  [/radio/i, 250],

  // ─── Comida ────────────────────────────────────────────────────
  [/liofilizad|deshidratad/i, 150],
  [/barras?|cereal|granola/i, 50],
  [/frutos secos|nueces|almendras|mix/i, 200],
  [/sales|electrolitos|isot[óo]nic/i, 100],
  [/sandwich|s[áa]ndwich|pan|marraqueta/i, 250],
  [/fruta|manzana|pl[áa]tano/i, 180],
  [/chocolate|dulce|golosina/i, 100],
  [/cocinilla|hornilla|estufa|rechaud/i, 350],
  [/olla|jarro|taza|cubiertos/i, 200],
  [/gas|cartucho/i, 230],

  // ─── Higiene y varios ──────────────────────────────────────────
  [/bloqueador|protector solar|filtro solar/i, 100],
  [/repelente/i, 90],
  [/papel higi[ée]nico|toalla|jab[óo]n|higiene/i, 150],
  [/bolsa de basura|basura/i, 40],
  [/mochila/i, 1400],
  [/documentos|carnet|permiso|identificaci[óo]n/i, 30],
  [/dinero|efectivo/i, 30],
]

/** Fallback por prioridad cuando ningún patrón coincide. */
const DEFAULT_BY_PRIORITY: Record<string, number> = {
  essential: 200,
  recommended: 150,
  optional: 100,
}

/**
 * Estima el peso en gramos de un ítem.
 * Reconoce cantidades explícitas de agua ("3 litros de agua" → 3000g) y
 * multiplicadores tipo "x2" / "x 3".
 */
export function estimateGrams(itemName: string, priority: string = 'recommended'): number {
  const name = itemName.trim()

  // Caso especial: litros de agua declarados en el texto (1L ≈ 1000g).
  const liters = name.match(/(\d+(?:[.,]\d+)?)\s*(?:l|lt|litros?)\b/i)
  if (liters && /agua|hidrataci[óo]n|bebida/i.test(name)) {
    return Math.round(parseFloat(liters[1].replace(',', '.')) * 1000)
  }

  const base = WEIGHT_RULES.find(([pattern]) => pattern.test(name))?.[1]
  const grams = base && base > 0 ? base : (DEFAULT_BY_PRIORITY[priority] ?? 150)

  // "x2", "x 3", "(x2)" multiplican el peso base.
  const multiplier = name.match(/\bx\s*(\d+)/i)
  if (multiplier) {
    const n = parseInt(multiplier[1], 10)
    if (n > 1 && n <= 20) return grams * n
  }

  return grams
}

/**
 * Peso recomendado de mochila: ~20% del peso corporal para trekking de día,
 * ajustado por la duración estimada de la ruta.
 */
export function recommendedKg(estimatedHours: number, bodyWeightKg = 70): number {
  const ratio = estimatedHours > 8 ? 0.25 : 0.2
  return Math.round(bodyWeightKg * ratio * 10) / 10
}
