import type { SystemKind } from '../data/constants.ts'
import { sinFromCos } from './cable.ts'

export type PowerTriangle = {
  activeW: number
  reactiveVar: number
  apparentVa: number
  formula: string
}

export function powerTriangle(
  system: SystemKind,
  voltage: number,
  current: number,
  cosPhi: number,
): PowerTriangle {
  const apparent = system === 'mono' ? voltage * current : Math.sqrt(3) * voltage * current
  const active = apparent * cosPhi
  const reactive = apparent * sinFromCos(cosPhi)
  const formula =
    system === 'mono'
      ? 'S = V · I. P = S · cos φ. Q = S · sen φ.'
      : 'S = √3 · V · I. P = S · cos φ. Q = S · sen φ.'
  return { activeW: active, reactiveVar: reactive, apparentVa: apparent, formula }
}
