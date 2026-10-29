import {
  AMPACITY,
  type AmpacityFamily,
  COLS,
  GROUPING,
  type GroupingKind,
  METHODS,
  type MethodId,
  SOLAR_FACTOR,
} from '../data/ampacity.ts'
import {
  BREAKERS,
  CONDUCTIVITY,
  FUSES_GG,
  INSULATION_TMAX,
  type Insulation,
  type LineId,
  lineLimit,
  type Material,
  REACTANCE_FACTOR,
  SECTIONS,
  type SystemKind,
  usesBreakerCurrent,
  VOLTAGE,
} from '../data/constants.ts'
import { roundTo } from './units.ts'

export type CableStatus = 'ok' | 'warn' | 'danger'
export type ProtectionKind = 'pia' | 'gg'
export type Curve = 'B' | 'C' | 'D'

const BURIED = new Set<MethodId>(['D1', 'D2'])

export function temperatureFactor(
  insulation: Insulation,
  ambientC: number,
  buried: boolean,
): number {
  const tmax = INSULATION_TMAX[insulation]
  const tref = buried ? 25 : 40
  if (ambientC >= tmax) return 0
  return roundTo(Math.sqrt((tmax - ambientC) / (tmax - tref)), 2)
}

export function groupingFactor(kind: GroupingKind, circuits: number): number {
  const table: Record<number, number> = GROUPING[kind]
  const count = Math.max(1, Math.round(circuits))
  const direct = table[count]
  if (direct !== undefined) return direct
  const keys = Object.keys(table)
    .map(Number)
    .sort((a, b) => a - b)
  const next = keys.find((key) => key >= count)
  const chosen = next ?? keys[keys.length - 1]
  return chosen === undefined ? 1 : (table[chosen] ?? 1)
}

export function familyOf(material: Material, insulation: Insulation): AmpacityFamily | null {
  if (material === 'Al' && insulation !== 'XLPE') return null
  if (material === 'Cu' && insulation === 'PVC') return 'Cu_PVC'
  if (material === 'Cu' && insulation === 'XLPE') return 'Cu_XLPE'
  return 'Al_XLPE'
}

export function baseAmpacity(
  material: Material,
  insulation: Insulation,
  section: number,
  method: MethodId,
  loaded: 2 | 3,
): number | null {
  const family = familyOf(material, insulation)
  if (!family) return null
  const table = AMPACITY[family] as Record<number, readonly (number | null)[]>
  const row = table[section]
  if (!row) return null
  const index = COLS.indexOf(`${method}_${loaded}` as (typeof COLS)[number])
  const value = row[index]
  return value ?? null
}

export function correctedAmpacity(
  base: number,
  insulation: Insulation,
  ambientC: number,
  method: MethodId,
  grouping: GroupingKind,
  circuits: number,
  solar: boolean,
): number {
  const kt = temperatureFactor(insulation, ambientC, BURIED.has(method))
  const kg = groupingFactor(grouping, circuits)
  const ks = solar && !BURIED.has(method) ? SOLAR_FACTOR : 1
  return base * kt * kg * ks
}

export function ceilingSection(value: number): number | null {
  return SECTIONS.find((section) => section + 1e-9 >= value) ?? null
}

export function selectBreaker(current: number): number | null {
  return BREAKERS.find((rating) => rating + 1e-9 >= current) ?? null
}

export function selectFuse(current: number, iz: number): number | null {
  return FUSES_GG.find((rating) => rating + 1e-9 >= current && rating <= 0.906 * iz + 1e-9) ?? null
}

/** ITC-BT-19, tabla 2. Sección del conductor de protección. */
export function protectiveEarth(phaseSection: number): number | null {
  if (phaseSection <= 16) return ceilingSection(phaseSection)
  if (phaseSection <= 35) return 16
  return ceilingSection(phaseSection / 2)
}

export function conductivityOf(material: Material, insulation: Insulation): number {
  const temp = INSULATION_TMAX[insulation]
  return temp === 90 ? CONDUCTIVITY[material][90] : CONDUCTIVITY[material][70]
}

function reactanceOf(section: number): number {
  if (section <= 120) return 0
  return REACTANCE_FACTOR[section] ?? 0
}

export function sinFromCos(cosPhi: number): number {
  const clamped = Math.min(1, Math.max(0, cosPhi))
  return Math.sqrt(1 - clamped * clamped)
}

export type DropInput = {
  system: SystemKind
  lengthM: number
  currentA: number
  sectionMm2: number
  cosPhi: number
  conductivity: number
  includeReactance?: boolean
}

/** Caída de tensión de línea, en voltios. R' en Ω/m. */
export function voltageDropVolts(input: DropInput): number {
  const k = input.system === 'mono' ? 2 : Math.sqrt(3)
  const resistance = 1 / (input.conductivity * input.sectionMm2)
  const reactance = input.includeReactance ? reactanceOf(input.sectionMm2) * resistance : 0
  return (
    k *
    input.lengthM *
    input.currentA *
    (resistance * input.cosPhi + reactance * sinFromCos(input.cosPhi))
  )
}

export function sectionForDrop(
  input: Omit<DropInput, 'sectionMm2' | 'includeReactance'> & {
    dropVolts: number
  },
): number {
  const k = input.system === 'mono' ? 2 : Math.sqrt(3)
  return (
    (k * input.lengthM * input.currentA * input.cosPhi) / (input.conductivity * input.dropVolts)
  )
}

export function sectionByDrop(input: Omit<DropInput, 'sectionMm2'> & { dropVolts: number }): {
  raw: number
  section: number | null
  dropVolts: number
} {
  const raw = sectionForDrop(input)
  const first = ceilingSection(raw)
  if (first === null) return { raw, section: null, dropVolts: Number.POSITIVE_INFINITY }
  let section = first
  let drop = voltageDropVolts({ ...input, sectionMm2: section, includeReactance: true })
  while (section > 120 && drop > input.dropVolts + 1e-6) {
    const next = SECTIONS.find((item) => item > section)
    if (next === undefined) break
    section = next
    drop = voltageDropVolts({ ...input, sectionMm2: section, includeReactance: true })
  }
  return { raw, section, dropVolts: drop }
}

export function maxLengthM(input: Omit<DropInput, 'lengthM'> & { dropVolts: number }): number {
  const k = input.system === 'mono' ? 2 : Math.sqrt(3)
  const resistance = 1 / (input.conductivity * input.sectionMm2)
  const reactance = input.includeReactance ? reactanceOf(input.sectionMm2) * resistance : 0
  const perMeter =
    k * input.currentA * (resistance * input.cosPhi + reactance * sinFromCos(input.cosPhi))
  if (perMeter <= 0) return Number.POSITIVE_INFINITY
  return input.dropVolts / perMeter
}

export type LoadKind = 'resistiva' | 'general' | 'motor' | 'descarga' | 've'

export function loadFactorOf(kind: LoadKind): number {
  if (kind === 'motor') return 1.25
  if (kind === 'descarga') return 1.8
  return 1
}

export function suggestedCurve(kind: LoadKind): Curve {
  if (kind === 'resistiva') return 'B'
  if (kind === 'motor') return 'D'
  return 'C'
}

export type CableInput = {
  mode: 'design' | 'verify'
  system: SystemKind
  powerW: number | null
  currentA: number | null
  cosPhi: number
  lengthM: number
  material: Material
  insulation: Insulation
  method: MethodId
  ambientC: number
  grouping: GroupingKind
  circuits: number
  solar: boolean
  protection: ProtectionKind
  lineId: LineId
  load: LoadKind
  sectionMm2: number | null
  minSectionMm2: number
  fixedBreakerA: number | null
}

export type CableResult = {
  ok: boolean
  error: string | null
  ib: number
  currentForDrop: number
  breakerA: number | null
  fuseA: number | null
  iz: number | null
  sectionHeating: number | null
  sectionDropRaw: number | null
  sectionDrop: number | null
  sectionFinal: number | null
  dropVolts: number | null
  dropPercent: number | null
  limitPercent: number
  limitVolts: number
  status: CableStatus
  reasons: string[]
  peMm2: number | null
  maxLength: number | null
  lossesW: number | null
  curve: Curve
  conductivity: number
  formula: string
  methodLabel: string
}

function regulatoryMin(input: CableInput): number {
  let min = input.material === 'Al' ? 10 : 1.5
  if (input.lineId.startsWith('di') && input.material === 'Cu') min = Math.max(min, 6)
  if (input.lineId === 've') min = Math.max(min, input.material === 'Al' ? 4 : 2.5)
  return Math.max(min, input.minSectionMm2)
}

function demandCurrent(input: CableInput): number | null {
  const factor = loadFactorOf(input.load)
  if (input.currentA !== null && input.currentA > 0) return input.currentA * factor
  if (input.powerW !== null && input.powerW > 0 && input.cosPhi > 0) {
    const voltage = VOLTAGE[input.system]
    const base =
      input.system === 'mono'
        ? input.powerW / (voltage * input.cosPhi)
        : input.powerW / (Math.sqrt(3) * voltage * input.cosPhi)
    return base * factor
  }
  return null
}

function worst(current: CableStatus, next: CableStatus): CableStatus {
  const rank = { ok: 0, warn: 1, danger: 2 }
  return rank[next] > rank[current] ? next : current
}

export function designCable(input: CableInput): CableResult {
  const limit = lineLimit(input.lineId)
  const voltage = VOLTAGE[input.system]
  const limitVolts = (limit.pct / 100) * voltage
  const conductivity = conductivityOf(input.material, input.insulation)
  const loaded: 2 | 3 = input.system === 'mono' ? 2 : 3
  const curve = suggestedCurve(input.load)
  const empty = (error: string): CableResult => ({
    ok: false,
    error,
    ib: 0,
    currentForDrop: 0,
    breakerA: input.fixedBreakerA,
    fuseA: null,
    iz: null,
    sectionHeating: null,
    sectionDropRaw: null,
    sectionDrop: null,
    sectionFinal: null,
    dropVolts: null,
    dropPercent: null,
    limitPercent: limit.pct,
    limitVolts,
    status: 'danger',
    reasons: [error],
    peMm2: null,
    maxLength: null,
    lossesW: null,
    curve,
    conductivity,
    formula: '',
    methodLabel: METHODS[input.method],
  })

  if (input.material === 'Al' && input.insulation !== 'XLPE') {
    return empty('El aluminio de esta tabla es XLPE. El PVC de aluminio no está tabulado.')
  }
  if (input.cosPhi <= 0 || input.cosPhi > 1)
    return empty('El factor de potencia tiene que estar entre 0 y 1.')
  if (input.lengthM <= 0) return empty('La longitud tiene que ser mayor que cero.')

  const ib = demandCurrent(input)
  if (ib === null) return empty('Indica potencia o intensidad.')

  const breakerA = input.fixedBreakerA ?? (input.protection === 'pia' ? selectBreaker(ib) : null)
  if (input.protection === 'pia' && breakerA === null) {
    return empty('La intensidad supera el mayor PIA de la lista (125 A).')
  }
  const rating = input.protection === 'pia' ? breakerA : selectBreaker(ib)
  if (rating === null) return empty('No hay un calibre comercial para esa intensidad.')

  const sections = SECTIONS.filter((section) => (input.material === 'Al' ? section >= 10 : true))
  let sectionHeating: number | null = null
  for (const section of sections) {
    const base = baseAmpacity(input.material, input.insulation, section, input.method, loaded)
    if (base === null) continue
    const iz = correctedAmpacity(
      base,
      input.insulation,
      input.ambientC,
      input.method,
      input.grouping,
      input.circuits,
      input.solar,
    )
    const protectedOk =
      input.protection === 'pia' ? rating <= iz + 1e-9 : rating <= 0.906 * iz + 1e-9
    if (protectedOk) {
      sectionHeating = section
      break
    }
  }

  const currentForDrop = usesBreakerCurrent(input.lineId) ? rating : ib
  const dropped = sectionByDrop({
    system: input.system,
    lengthM: input.lengthM,
    currentA: currentForDrop,
    cosPhi: input.cosPhi,
    conductivity,
    dropVolts: limitVolts,
  })

  const floor = regulatoryMin(input)
  const candidates = [sectionHeating, dropped.section, ceilingSection(floor)].filter(
    (value): value is number => value !== null,
  )
  const sectionFinal =
    input.mode === 'verify' ? input.sectionMm2 : candidates.length ? Math.max(...candidates) : null

  if (sectionFinal === null) {
    return empty('Ninguna sección de la tabla cumple el calentamiento con ese método.')
  }

  const baseFinal = baseAmpacity(
    input.material,
    input.insulation,
    sectionFinal,
    input.method,
    loaded,
  )
  const iz =
    baseFinal === null
      ? null
      : correctedAmpacity(
          baseFinal,
          input.insulation,
          input.ambientC,
          input.method,
          input.grouping,
          input.circuits,
          input.solar,
        )
  const dropVolts = voltageDropVolts({
    system: input.system,
    lengthM: input.lengthM,
    currentA: currentForDrop,
    sectionMm2: sectionFinal,
    cosPhi: input.cosPhi,
    conductivity,
    includeReactance: true,
  })
  const dropPercent = (dropVolts / voltage) * 100
  const fuseA = input.protection === 'gg' && iz !== null ? selectFuse(ib, iz) : null

  const reasons: string[] = []
  let status: CableStatus = 'ok'
  if (ib > rating + 1e-9) {
    status = 'danger'
    reasons.push('La intensidad de diseño supera el calibre de la protección.')
  }
  if (iz === null) {
    status = 'danger'
    reasons.push('Esa sección no está tabulada para el método elegido.')
  } else if (rating > iz + 1e-9) {
    status = 'danger'
    reasons.push('La protección queda por encima de la intensidad admisible del cable.')
  } else if (iz < 1.1 * rating) {
    status = worst(status, 'warn')
    reasons.push('El cable queda justo: la admisible no llega a 1,1 veces el calibre.')
  }
  if (input.protection === 'gg' && fuseA === null) {
    status = 'danger'
    reasons.push('Ningún fusible gG cumple Ib ≤ In ≤ 0,906·Iz.')
  }
  const dropOver = dropVolts > limitVolts + 1e-6
  if (dropOver && input.mode === 'verify') {
    status = 'danger'
    reasons.push('La caída de tensión supera el límite de la línea.')
  } else if (dropPercent > limit.pct * 0.8) {
    status = worst(status, 'warn')
    reasons.push('La caída supera el 80 % del límite.')
  }
  if (reasons.length === 0) reasons.push('Cumple calentamiento y caída de tensión.')

  const peMm2 = protectiveEarth(sectionFinal)
  const maxLength = maxLengthM({
    system: input.system,
    currentA: currentForDrop,
    sectionMm2: sectionFinal,
    cosPhi: input.cosPhi,
    conductivity,
    dropVolts: limitVolts,
    includeReactance: true,
  })
  const resistance = input.lengthM / (conductivity * sectionFinal)
  const conductors = input.system === 'mono' ? 2 : 3
  const lossesW = conductors * ib * ib * resistance
  const kLabel = input.system === 'mono' ? '2' : '√3'
  const formula = `S = ${kLabel} · L · I · cos φ / (γ · e) = ${kLabel} · ${roundTo(input.lengthM, 2)} · ${roundTo(currentForDrop, 2)} · ${roundTo(input.cosPhi, 2)} / (${conductivity} · ${roundTo(limitVolts, 2)})`

  return {
    ok: true,
    error: null,
    ib,
    currentForDrop,
    breakerA: input.protection === 'pia' ? breakerA : rating,
    fuseA,
    iz,
    sectionHeating,
    sectionDropRaw: dropped.raw,
    sectionDrop: dropped.section,
    sectionFinal,
    dropVolts,
    dropPercent,
    limitPercent: limit.pct,
    limitVolts,
    status,
    reasons,
    peMm2,
    maxLength,
    lossesW,
    curve,
    conductivity,
    formula,
    methodLabel: METHODS[input.method],
  }
}

export { METHODS }
