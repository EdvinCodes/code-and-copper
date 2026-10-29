import { EQUIPMENT_KW } from '../data/refrigerants.ts'

export type InsulationLevel = 'bueno' | 'medio' | 'deficiente'
export type Orientation = 'N' | 'E' | 'S' | 'O'
export type ClimateZone = 'suave' | 'calurosa'

const insulationW = { bueno: 30, medio: 40, deficiente: 50 } as const
const orientationFactor = { N: 1, E: 1.05, S: 1.1, O: 1.15 } as const

export type ThermalInput = {
  areaM2: number
  heightM: number
  insulation: InsulationLevel
  orientation: Orientation
  underRoof: boolean
  largeWindows: boolean
  zone: ClimateZone
  people: number
  equipmentW: number
}

export type ThermalResult = {
  volumeM3: number
  watts: number
  kw: number
  fgPerHour: number
  equipmentKw: number | null
  note: string | null
}

export function thermalLoad(input: ThermalInput): ThermalResult {
  const volume = input.areaM2 * input.heightM
  let watts = volume * insulationW[input.insulation] * orientationFactor[input.orientation]
  if (input.underRoof) watts *= 1.15
  if (input.largeWindows) watts *= 1.1
  watts *= input.zone === 'calurosa' ? 1.15 : 1
  watts += Math.max(0, input.people - 2) * 120
  watts += input.equipmentW
  const kw = watts / 1000
  const equipment = EQUIPMENT_KW.find((size) => size + 1e-9 >= kw) ?? null
  return {
    volumeM3: volume,
    watts,
    kw,
    fgPerHour: Math.round((watts * 860) / 1000),
    equipmentKw: equipment,
    note:
      equipment === null
        ? 'Por encima de 7,1 kW: cálculo de cargas o conductos / multisplit.'
        : null,
  }
}
