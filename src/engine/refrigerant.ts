import { ATM_BAR, type GasId, PT_TEMPS, REFRIGERANTS } from '../data/refrigerants.ts'

export type SaturationSide = 'bubble' | 'dew'

function seriesOf(gas: GasId, side: SaturationSide): readonly number[] {
  const item = REFRIGERANTS[gas]
  if ('bubble' in item) return side === 'bubble' ? item.bubble : item.dew
  return item.p
}

function interpolate(tempC: number, values: readonly number[]): number | null {
  const temps = PT_TEMPS
  const first = temps[0]
  const last = temps[temps.length - 1]
  if (first === undefined || last === undefined) return null
  if (tempC < first || tempC > last) return null
  for (let index = 0; index < temps.length; index += 1) {
    const current = temps[index]
    const pressure = values[index]
    if (current === undefined || pressure === undefined) return null
    if (tempC === current) return pressure
    const next = temps[index + 1]
    const nextPressure = values[index + 1]
    if (next === undefined || nextPressure === undefined) return null
    if (tempC > current && tempC < next) {
      const fraction = (tempC - current) / (next - current)
      const ln =
        Math.log(pressure + ATM_BAR) * (1 - fraction) + Math.log(nextPressure + ATM_BAR) * fraction
      return Math.exp(ln) - ATM_BAR
    }
  }
  return null
}

function invert(pressure: number, values: readonly number[]): number | null {
  const temps = PT_TEMPS
  for (let index = 0; index < temps.length; index += 1) {
    const currentPressure = values[index]
    const currentTemp = temps[index]
    if (currentPressure === undefined || currentTemp === undefined) return null
    if (Math.abs(currentPressure - pressure) < 1e-9) return currentTemp
    const nextPressure = values[index + 1]
    const nextTemp = temps[index + 1]
    if (nextPressure === undefined || nextTemp === undefined) return null
    const low = Math.min(currentPressure, nextPressure)
    const high = Math.max(currentPressure, nextPressure)
    if (pressure > low && pressure < high) {
      const lnP = Math.log(pressure + ATM_BAR)
      const ln0 = Math.log(currentPressure + ATM_BAR)
      const ln1 = Math.log(nextPressure + ATM_BAR)
      const fraction = (lnP - ln0) / (ln1 - ln0)
      return currentTemp + fraction * (nextTemp - currentTemp)
    }
  }
  return null
}

export function saturationPressure(
  gas: GasId,
  tempC: number,
  side: SaturationSide = 'dew',
): number | null {
  return interpolate(tempC, seriesOf(gas, side))
}

export function saturationTemperature(
  gas: GasId,
  pressureBar: number,
  side: SaturationSide = 'dew',
): number | null {
  return invert(pressureBar, seriesOf(gas, side))
}

export function superheat(gas: GasId, suctionBar: number, pipeC: number): number | null {
  const sat = saturationTemperature(gas, suctionBar, 'dew')
  if (sat === null) return null
  return pipeC - sat
}

export function subcooling(gas: GasId, liquidBar: number, pipeC: number): number | null {
  const sat = saturationTemperature(gas, liquidBar, 'bubble')
  if (sat === null) return null
  return sat - pipeC
}

export type Band = 'ok' | 'warn' | 'danger'

export function bandOf(value: number, green: [number, number], amber: [number, number]): Band {
  if (value >= green[0] && value <= green[1]) return 'ok'
  if (value >= amber[0] && value <= amber[1]) return 'warn'
  return 'danger'
}

export function chargeDiagnosis(sh: number, sc: number): string {
  const shHigh = sh > 10
  const shLow = sh < 5
  const scHigh = sc > 8
  const scLow = sc < 3
  if (shHigh && scLow) return 'SH alto y SC bajo: posible falta de gas.'
  if (shLow && scHigh) return 'SH bajo y SC alto: posible exceso de carga.'
  if (shHigh && scHigh) return 'SH alto y SC alto: posible restricción (filtro, capilar o EEV).'
  if (shLow && scLow)
    return 'SH bajo y SC bajo: compresor ineficiente o poco caudal de aire en el evaporador.'
  return 'SH y SC dentro o cerca de la banda habitual.'
}
