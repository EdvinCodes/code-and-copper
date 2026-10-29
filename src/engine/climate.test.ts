import { describe, expect, it } from 'vitest'
import { flowFromPower, powerFromFlow } from './hydronic.ts'
import { saturationPressure, saturationTemperature, subcooling, superheat } from './refrigerant.ts'
import { thermalLoad } from './thermalLoad.ts'
import { roundTo } from './units.ts'

describe('presión-temperatura', () => {
  it('respeta los puntos de tabla y la interpolación', () => {
    expect(saturationPressure('R32', 0)).toBe(7.12)
    expect(saturationPressure('R290', 40)).toBe(12.68)
    expect(saturationPressure('R454B', 0, 'bubble')).toBe(6.66)
    expect(saturationPressure('R454B', 0, 'dew')).toBe(6.31)
    expect(saturationPressure('R32', 2.5)).toBeCloseTo(7.78, 1)
    expect(saturationTemperature('R32', 8.5)).toBe(5)
  })

  it('calcula recalentamiento y subenfriamiento', () => {
    expect(superheat('R32', 8.5, 12)).toBe(7)
    expect(superheat('R454B', 7.56, 11)).toBe(6)
    expect(subcooling('R410A', 26.32, 40)).toBe(5)
    expect(subcooling('R454B', 25.04, 41)).toBe(4)
  })
})

describe('carga y caudal', () => {
  it('estima una estancia de 20 m² al sur', () => {
    const result = thermalLoad({
      areaM2: 20,
      heightM: 2.6,
      insulation: 'medio',
      orientation: 'S',
      underRoof: false,
      largeWindows: false,
      zone: 'suave',
      people: 2,
      equipmentW: 0,
    })
    expect(roundTo(result.kw, 2)).toBe(2.29)
    expect(result.fgPerHour).toBe(1968)
    expect(result.equipmentKw).toBe(2.5)
  })

  it('pasa de potencia a caudal y al revés', () => {
    expect(roundTo(flowFromPower(8, 5) ?? 0, 1)).toBe(22.9)
    expect(roundTo(powerFromFlow(20, 5), 2)).toBe(6.98)
  })
})
