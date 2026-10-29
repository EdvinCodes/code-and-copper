import type { Band } from './refrigerant.ts'

export type DeltaMode = 'split-frio' | 'split-calor' | 'aerotermia'

export function airDelta(
  mode: Exclude<DeltaMode, 'aerotermia'>,
  delta: number,
): { band: Band; text: string } {
  if (mode === 'split-frio') {
    if (delta < 6)
      return {
        band: 'danger',
        text: 'Muy bajo: falta de gas, compresor modulando, condensadora sucia o humedad alta.',
      }
    if (delta < 8)
      return { band: 'warn', text: 'Justo por debajo de la banda de un split en frío.' }
    if (delta <= 14)
      return { band: 'ok', text: 'Salto de aire correcto en frío, a plena carga y estable.' }
    if (delta <= 18)
      return { band: 'warn', text: 'Alto: poco caudal de aire. Revisa filtro, batería y turbina.' }
    return {
      band: 'danger',
      text: 'Muy alto: riesgo de hielo por falta de caudal o de intercambio.',
    }
  }
  if (delta < 10) return { band: 'danger', text: 'Muy poco salto en calor.' }
  if (delta < 15) return { band: 'warn', text: 'Justo por debajo de la banda de calor.' }
  if (delta <= 25) return { band: 'ok', text: 'Salto de aire correcto en calor.' }
  if (delta <= 30) return { band: 'warn', text: 'Alto para un split en calor.' }
  return { band: 'danger', text: 'Salto excesivo en calor.' }
}

export function waterDelta(measured: number, design = 5): { band: Band; text: string } {
  const gap = Math.abs(measured - design)
  if (gap <= 1.5) return { band: 'ok', text: `Cerca del ΔT de diseño (${design} K).` }
  if (gap <= 3) {
    return {
      band: 'warn',
      text:
        measured > design
          ? 'Por encima del diseño: posible poco caudal.'
          : 'Por debajo del diseño: exceso de caudal o poca potencia.',
    }
  }
  return {
    band: 'danger',
    text:
      measured > design
        ? 'ΔT alto: filtro, aire en el circuito, bomba o válvulas.'
        : 'ΔT bajo: demasiado caudal o el equipo no está entregando potencia.',
  }
}
