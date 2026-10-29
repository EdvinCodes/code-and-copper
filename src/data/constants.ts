/** Guía-BT Anexo 2 y REBT. Tensiones de red españolas, 50 Hz. */

export const VOLTAGE = { mono: 230, tri: 400 } as const
export const FREQUENCY_HZ = 50

/** Conductividad γ en m/(Ω·mm²). Guía-BT Anexo 2, tabla 3. */
export const CONDUCTIVITY = {
  Cu: { 20: 56, 70: 48, 90: 44 },
  Al: { 20: 35, 70: 30, 90: 28 },
} as const

export const INSULATION_TMAX = { PVC: 70, XLPE: 90 } as const

/** X ≈ f·R. Guía-BT Anexo 2, tabla 1. Hasta 120 mm², X ≈ 0. */
export const REACTANCE_FACTOR: Record<number, number> = { 150: 0.15, 185: 0.2, 240: 0.25 }

export const SECTIONS = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240] as const

/** ≤ 63 A: UNE-EN 60898-1. Por encima: UNE-EN 60947-2. */
export const BREAKERS = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125] as const

export const FUSES_GG = [
  2, 4, 6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400,
] as const

export const VOLTAGE_DROP_LIMITS = [
  {
    id: 'vivienda',
    label: 'Circuito interior de vivienda (ITC-BT-19/25)',
    pct: 3,
    useBreakerCurrent: true,
  },
  { id: 'alumbrado', label: 'Alumbrado, otras instalaciones (ITC-BT-19)', pct: 3 },
  { id: 'fuerza', label: 'Fuerza y demás usos, otras instalaciones (ITC-BT-19)', pct: 5 },
  { id: 've', label: 'Recarga VE desde el origen del circuito (ITC-BT-52)', pct: 5 },
  { id: 'di-unico', label: 'DI, usuario único sin LGA (ITC-BT-15)', pct: 1.5 },
  { id: 'di-concentrados', label: 'DI, contadores totalmente concentrados (ITC-BT-15)', pct: 1 },
  { id: 'di-parcial', label: 'DI, centralizaciones parciales (ITC-BT-15)', pct: 0.5 },
  {
    id: 'lga-concentrados',
    label: 'LGA, contadores totalmente concentrados (ITC-BT-14)',
    pct: 0.5,
  },
  { id: 'lga-parcial', label: 'LGA, centralizaciones parciales (ITC-BT-14)', pct: 1 },
] as const

export type SystemKind = keyof typeof VOLTAGE
export type Material = keyof typeof CONDUCTIVITY
export type Insulation = keyof typeof INSULATION_TMAX
export type LineId = (typeof VOLTAGE_DROP_LIMITS)[number]['id']
export type Section = (typeof SECTIONS)[number]

export function lineLimit(id: LineId): (typeof VOLTAGE_DROP_LIMITS)[number] {
  const found = VOLTAGE_DROP_LIMITS.find((item) => item.id === id)
  if (!found) throw new Error(`Límite desconocido: ${id}`)
  return found
}

export function usesBreakerCurrent(id: LineId): boolean {
  const limit = lineLimit(id)
  return 'useBreakerCurrent' in limit && limit.useBreakerCurrent === true
}
