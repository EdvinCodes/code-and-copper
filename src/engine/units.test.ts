import { describe, expect, it } from 'vitest'
import { formatNumber, parseDecimal, roundTo } from './units.ts'

describe('unidades', () => {
  it('acepta coma y punto decimal', () => {
    expect(parseDecimal('2,5')).toBe(2.5)
    expect(parseDecimal('2.5')).toBe(2.5)
    expect(parseDecimal('  16 ')).toBe(16)
    expect(parseDecimal('')).toBeNull()
    expect(parseDecimal('abc')).toBeNull()
  })

  it('formatea en español', () => {
    expect(formatNumber(2.5)).toBe('2,5')
    expect(formatNumber(1234.56, 1)).toBe('1.234,6')
  })

  it('redondea sin arrastrar binario', () => {
    expect(roundTo(2.8986, 2)).toBe(2.9)
    expect(roundTo(4.528, 2)).toBe(4.53)
  })
})
