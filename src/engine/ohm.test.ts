import { describe, expect, it } from 'vitest'
import { solveOhm } from './ohm.ts'
import { powerTriangle } from './power.ts'

describe('ley de Ohm', () => {
  it('resuelve las seis parejas', () => {
    const fromPower = solveOhm({ V: 230, P: 3680 })
    expect(fromPower).toMatchObject({ values: { I: 16, R: 14.375 } })
    const fromResistance = solveOhm({ I: 10, R: 23 })
    expect(fromResistance).toMatchObject({ values: { V: 230, P: 2300 } })
    const fromProduct = solveOhm({ R: 10, P: 1000 })
    expect(fromProduct).toMatchObject({ values: { V: 100, I: 10 } })
    expect(solveOhm({ V: 230, I: 10 })).toMatchObject({ values: { R: 23, P: 2300 } })
    expect(solveOhm({ V: 100, R: 10 })).toMatchObject({ values: { I: 10, P: 1000 } })
    expect(solveOhm({ I: 10, P: 1000 })).toMatchObject({ values: { V: 100, R: 10 } })
  })
})

describe('triángulo de potencias', () => {
  it('separa P, Q y S en monofásica', () => {
    const result = powerTriangle('mono', 230, 10, 0.8)
    expect(result.apparentVa).toBe(2300)
    expect(result.activeW).toBeCloseTo(1840, 6)
    expect(result.reactiveVar).toBeCloseTo(1380, 0)
  })
})
