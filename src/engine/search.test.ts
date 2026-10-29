import { describe, expect, it } from 'vitest'
import { matchesQuery } from './search.ts'

describe('buscador', () => {
  it('ignora acentos y mayúsculas', () => {
    expect(matchesQuery('diferencial', 'Interruptor diferencial')).toBe(true)
    expect(matchesQuery('vehiculo', 'Recarga del vehículo eléctrico')).toBe(true)
    expect(matchesQuery('knx', 'Colores de fase')).toBe(false)
  })
})
