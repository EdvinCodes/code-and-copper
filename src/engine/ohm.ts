export type OhmField = 'V' | 'I' | 'R' | 'P'

export type OhmSolution = {
  values: Record<OhmField, number>
  formula: string
}

const labels: Record<OhmField, string> = {
  V: 'V = I · R',
  I: 'I = V / R',
  R: 'R = V / I',
  P: 'P = V · I',
}

export function solveOhm(
  known: Partial<Record<OhmField, number>>,
): OhmSolution | { error: string } {
  const present = (Object.keys(known) as OhmField[]).filter((key) => {
    const value = known[key]
    return value !== undefined && Number.isFinite(value)
  })
  if (present.length !== 2) return { error: 'Hacen falta dos magnitudes.' }

  const value = (key: OhmField) => known[key] ?? 0
  const pair = [...present].sort().join('')
  let V = 0
  let I = 0
  let R = 0
  let P = 0
  let formula = ''

  if (pair === 'IV') {
    V = value('V')
    I = value('I')
    if (I === 0) return { error: 'La intensidad no puede ser cero.' }
    R = V / I
    P = V * I
    formula = `${labels.R}. ${labels.P}.`
  } else if (pair === 'RV') {
    V = value('V')
    R = value('R')
    if (R === 0) return { error: 'La resistencia no puede ser cero.' }
    I = V / R
    P = (V * V) / R
    formula = `${labels.I}. P = V² / R.`
  } else if (pair === 'PV') {
    V = value('V')
    P = value('P')
    if (V === 0) return { error: 'La tensión no puede ser cero.' }
    I = P / V
    R = (V * V) / P
    formula = 'I = P / V. R = V² / P.'
  } else if (pair === 'IR') {
    I = value('I')
    R = value('R')
    V = I * R
    P = I * I * R
    formula = `${labels.V}. P = I² · R.`
  } else if (pair === 'IP') {
    I = value('I')
    P = value('P')
    if (I === 0) return { error: 'La intensidad no puede ser cero.' }
    V = P / I
    R = P / (I * I)
    formula = 'V = P / I. R = P / I².'
  } else if (pair === 'PR') {
    P = value('P')
    R = value('R')
    if (R < 0 || P < 0) return { error: 'Potencia y resistencia tienen que ser positivas.' }
    V = Math.sqrt(P * R)
    I = R === 0 ? Number.POSITIVE_INFINITY : Math.sqrt(P / R)
    formula = 'V = √(P · R). I = √(P / R).'
  } else {
    return { error: 'Esa pareja de magnitudes no se puede resolver.' }
  }

  if (![V, I, R, P].every((item) => Number.isFinite(item))) {
    return { error: 'El resultado no es finito. Revisa los datos.' }
  }
  return { values: { V, I, R, P }, formula }
}
