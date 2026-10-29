import { describe, expect, it } from 'vitest'
import { AMPACITY, COLS } from '../data/ampacity.ts'
import { SECTIONS } from '../data/constants.ts'
import {
  baseAmpacity,
  type CableInput,
  ceilingSection,
  designCable,
  protectiveEarth,
  sectionByDrop,
  sectionForDrop,
  selectBreaker,
  temperatureFactor,
  voltageDropVolts,
} from './cable.ts'
import { roundTo } from './units.ts'

const conductivity = 48

function dropSection(lengthM: number, currentA: number, percent: number) {
  const dropVolts = (percent / 100) * 230
  const raw = sectionForDrop({
    system: 'mono',
    lengthM,
    currentA,
    cosPhi: 1,
    conductivity,
    dropVolts,
  })
  return { raw: roundTo(raw, 2), section: ceilingSection(raw) }
}

const baseInput: CableInput = {
  mode: 'verify',
  system: 'mono',
  powerW: null,
  currentA: 16,
  cosPhi: 1,
  lengthM: 25,
  material: 'Cu',
  insulation: 'PVC',
  method: 'B1',
  ambientC: 40,
  grouping: 'bundled',
  circuits: 1,
  solar: false,
  protection: 'pia',
  lineId: 'vivienda',
  load: 'general',
  sectionMm2: 2.5,
  minSectionMm2: 2.5,
  fixedBreakerA: 16,
}

describe('caída de tensión, Guía-BT anexo 2', () => {
  it('dimensiona la DI monofásica a γ = 48 y cos φ = 1', () => {
    expect(dropSection(10, 25, 1)).toEqual({ raw: 4.53, section: 6 })
    expect(dropSection(22, 25, 1)).toEqual({ raw: 9.96, section: 10 })
    expect(dropSection(35, 25, 1)).toEqual({ raw: 15.85, section: 16 })
    expect(dropSection(10, 40, 1).section).toBe(10)
    expect(dropSection(22, 40, 1).section).toBe(16)
    expect(dropSection(35, 40, 1).section).toBe(35)
  })

  it('en vivienda usa el 3 % y el mínimo de la tabla', () => {
    expect(dropSection(30, 16, 3)).toEqual({ raw: 2.9, section: 4 })
    expect(dropSection(20, 16, 3).raw).toBe(1.93)
    expect(Math.max(dropSection(20, 16, 3).section ?? 0, 2.5)).toBe(2.5)
  })

  it('en la LGA trifásica la reactancia obliga a subir de 185 a 240', () => {
    const limit = 0.005 * 400
    const common = {
      system: 'tri' as const,
      lengthM: 40,
      currentA: 250,
      cosPhi: 0.9,
      conductivity: 44,
    }
    const raw = sectionForDrop({ ...common, dropVolts: limit })
    expect(ceilingSection(raw)).toBe(185)
    const without = voltageDropVolts({ ...common, sectionMm2: 185, includeReactance: false })
    const with185 = voltageDropVolts({ ...common, sectionMm2: 185, includeReactance: true })
    const with240 = voltageDropVolts({ ...common, sectionMm2: 240, includeReactance: true })
    expect(without).toBeCloseTo(1.92, 2)
    expect(with185).toBeCloseTo(2.1, 2)
    expect(with185).toBeGreaterThan(limit)
    expect(with240).toBeCloseTo(1.655, 2)
    expect(sectionByDrop({ ...common, dropVolts: limit }).section).toBe(240)
  })
})

describe('verificación de un C2', () => {
  it('marca ámbar a 25 m y rojo a 30 m', () => {
    const at25 = designCable(baseInput)
    const at30 = designCable({ ...baseInput, lengthM: 30 })
    expect(roundTo(at25.dropPercent ?? 0, 2)).toBe(2.9)
    expect(at25.status).toBe('warn')
    expect(roundTo(at30.dropPercent ?? 0, 2)).toBe(3.48)
    expect(at30.status).toBe('danger')
  })
})

describe('tablas y protección', () => {
  it('lee la ampacidad de las columnas pedidas', () => {
    expect(baseAmpacity('Cu', 'PVC', 2.5, 'B1', 2)).toBe(20)
    expect(baseAmpacity('Cu', 'XLPE', 16, 'C', 3)).toBe(87)
    expect(baseAmpacity('Al', 'XLPE', 25, 'E', 2)).toBe(98)
    expect(baseAmpacity('Cu', 'PVC', 10, 'F', 2)).toBeNull()
  })

  it('corrige la temperatura a dos decimales', () => {
    expect(temperatureFactor('PVC', 30, false)).toBe(1.15)
    expect(temperatureFactor('PVC', 45, false)).toBe(0.91)
    expect(temperatureFactor('XLPE', 50, false)).toBe(0.89)
  })

  it('elige PIA y sección de tierra', () => {
    expect(selectBreaker(14.2)).toBe(16)
    expect(selectBreaker(23.5)).toBe(25)
    expect(protectiveEarth(16)).toBe(16)
    expect(protectiveEarth(35)).toBe(16)
    expect(protectiveEarth(50)).toBe(25)
    expect(protectiveEarth(95)).toBe(50)
    expect(protectiveEarth(150)).toBe(95)
    expect(protectiveEarth(240)).toBe(120)
  })

  it('mantiene filas de 18 valores crecientes', () => {
    for (const table of Object.values(AMPACITY)) {
      const sections = Object.keys(table)
        .map(Number)
        .sort((a, b) => a - b)
      expect(sections.every((section) => (SECTIONS as readonly number[]).includes(section))).toBe(
        true,
      )
      for (const [index, section] of sections.entries()) {
        const row = table[section as keyof typeof table]
        expect(row).toHaveLength(COLS.length)
        if (index === 0) continue
        const previousSection = sections[index - 1]
        if (previousSection === undefined) continue
        const previous = table[previousSection as keyof typeof table]
        row.forEach((value, column) => {
          const before = previous[column]
          if (value != null && before != null) expect(value).toBeGreaterThan(before)
        })
      }
    }
  })
})
