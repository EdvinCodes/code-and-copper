/** ITC-BT-25, tabla 1 del texto BOE (modificada por el RD 1053/2014). Tensión 230 V F-N. */

export type CircuitId = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C8' | 'C9' | 'C10' | 'C11' | 'C13'

export type HousingCircuit = {
  id: CircuitId
  name: string
  powerW: number | null
  powerNote: string | null
  fs: number | null
  fu: number | null
  take: string
  breakerA: number | null
  maxPoints: number | null
  sectionMm2: number
  tubeMm: number
  notes: string[]
  lineId: 'vivienda' | 've'
}

export const HOUSING_CIRCUITS: HousingCircuit[] = [
  {
    id: 'C1',
    name: 'Iluminación',
    powerW: 200,
    powerNote: null,
    fs: 0.75,
    fu: 0.5,
    take: 'Punto de luz, con conductor de protección',
    breakerA: 10,
    maxPoints: 30,
    sectionMm2: 1.5,
    tubeMm: 16,
    lineId: 'vivienda',
    notes: ['C6: un circuito adicional del tipo C1 por cada 30 puntos de luz.'],
  },
  {
    id: 'C2',
    name: 'Tomas de uso general',
    powerW: 3450,
    powerNote: null,
    fs: 0.2,
    fu: 0.25,
    take: 'Base 16 A 2P+T',
    breakerA: 16,
    maxPoints: 20,
    sectionMm2: 2.5,
    tubeMm: 20,
    lineId: 'vivienda',
    notes: [
      'C7: un circuito adicional del tipo C2 por cada 20 tomas, o si la superficie útil supera 160 m².',
    ],
  },
  {
    id: 'C3',
    name: 'Cocina y horno',
    powerW: 5400,
    powerNote: null,
    fs: 0.5,
    fu: 0.75,
    take: 'Base 25 A 2P+T',
    breakerA: 25,
    maxPoints: 2,
    sectionMm2: 6,
    tubeMm: 25,
    lineId: 'vivienda',
    notes: ['C12 puede añadir otro circuito C3 o C4.'],
  },
  {
    id: 'C4',
    name: 'Lavadora, lavavajillas y termo',
    powerW: 3450,
    powerNote: null,
    fs: 0.66,
    fu: 0.75,
    take: 'Base 16 A 2P+T con fusible o PIA de 16 A',
    breakerA: 20,
    maxPoints: 3,
    sectionMm2: 4,
    tubeMm: 20,
    lineId: 'vivienda',
    notes: [
      'Cada toma puede salir en 2,5 mm² desde una caja de derivación del circuito de 4 mm².',
      'Si cada aparato tiene circuito propio con PIA de 16 A, no hacen falta fusibles en la toma. Ese desdoble no implica electrificación elevada ni otro diferencial.',
    ],
  },
  {
    id: 'C5',
    name: 'Baño y cuarto de cocina',
    powerW: 3450,
    powerNote: null,
    fs: 0.4,
    fu: 0.5,
    take: 'Base 16 A 2P+T',
    breakerA: 16,
    maxPoints: 6,
    sectionMm2: 2.5,
    tubeMm: 20,
    lineId: 'vivienda',
    notes: ['C12: circuito adicional tipo C5 cuando hay más de 6 tomas.'],
  },
  {
    id: 'C8',
    name: 'Calefacción',
    powerW: null,
    powerNote: 'Potencia máxima 5750 W por circuito',
    fs: null,
    fu: null,
    take: 'Según el emisor',
    breakerA: 25,
    maxPoints: null,
    sectionMm2: 6,
    tubeMm: 25,
    lineId: 'vivienda',
    notes: [],
  },
  {
    id: 'C9',
    name: 'Aire acondicionado',
    powerW: null,
    powerNote: 'Potencia máxima 5750 W por circuito',
    fs: null,
    fu: null,
    take: 'Según el equipo',
    breakerA: 25,
    maxPoints: null,
    sectionMm2: 6,
    tubeMm: 25,
    lineId: 'vivienda',
    notes: [],
  },
  {
    id: 'C10',
    name: 'Secadora',
    powerW: 3450,
    powerNote: null,
    fs: 1,
    fu: 0.75,
    take: 'Base 16 A 2P+T',
    breakerA: 16,
    maxPoints: 1,
    sectionMm2: 2.5,
    tubeMm: 20,
    lineId: 'vivienda',
    notes: [],
  },
  {
    id: 'C11',
    name: 'Automatización',
    powerW: null,
    powerNote: 'Potencia máxima 2300 W por circuito',
    fs: null,
    fu: null,
    take: 'Alimentación del sistema de automatización',
    breakerA: 10,
    maxPoints: null,
    sectionMm2: 1.5,
    tubeMm: 16,
    lineId: 'vivienda',
    notes: [],
  },
  {
    id: 'C13',
    name: 'Recarga del vehículo eléctrico',
    powerW: null,
    powerNote: 'Potencia, base y PIA según la ITC-BT-52',
    fs: 1,
    fu: 1,
    take: 'Según la ITC-BT-52',
    breakerA: null,
    maxPoints: 3,
    sectionMm2: 2.5,
    tubeMm: 20,
    lineId: 've',
    notes: [
      'Diferencial exclusivo, como máximo 30 mA, clase A. En modo 3, además protección frente a corriente continua lisa superior a 6 mA.',
      'Caída de tensión máxima del 5 % desde el origen del circuito.',
      'En monofásica, la potencia instalada no supera 9200 W.',
    ],
  },
]

export const ELECTRIFICATION = {
  basica: { powerW: 5750, igaA: 25, circuits: 'C1 a C5' },
  elevada: { powerW: 9200, igaA: 40, circuits: 'C1 a C5 más los adicionales que correspondan' },
} as const

/** ITC-BT-52, tabla 1. Potencias instaladas normalizadas de un C13 en vivienda unifamiliar. */
export const EV_STEPS = [
  { system: 'mono' as const, breakerA: 10, powerW: 2300, stations: '1' },
  { system: 'mono' as const, breakerA: 16, powerW: 3680, stations: '1' },
  { system: 'mono' as const, breakerA: 20, powerW: 4600, stations: '1' },
  { system: 'mono' as const, breakerA: 32, powerW: 7360, stations: '1' },
  { system: 'mono' as const, breakerA: 40, powerW: 9200, stations: '1' },
  { system: 'tri' as const, breakerA: 16, powerW: 11085, stations: '1 a 3' },
  { system: 'tri' as const, breakerA: 20, powerW: 13856, stations: '1 a 4' },
  { system: 'tri' as const, breakerA: 32, powerW: 22170, stations: '1 a 6' },
  { system: 'tri' as const, breakerA: 40, powerW: 27713, stations: '1 a 8' },
]

export function circuitById(id: CircuitId): HousingCircuit {
  const found = HOUSING_CIRCUITS.find((item) => item.id === id)
  if (!found) throw new Error(`Circuito desconocido: ${id}`)
  return found
}
