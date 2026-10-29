import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ExplainAsDev } from '../../../components/ExplainAsDev.tsx'
import { Formula } from '../../../components/Formula.tsx'
import { NumberField } from '../../../components/NumberField.tsx'
import { SafetyBanner } from '../../../components/SafetyBanner.tsx'
import { Segmented } from '../../../components/Segmented.tsx'
import { type OhmField, solveOhm } from '../../../engine/ohm.ts'
import { powerTriangle } from '../../../engine/power.ts'
import { formatNumber, parseDecimal } from '../../../engine/units.ts'
import { useHistory } from '../../../stores/history.ts'

const fields: { key: OhmField; label: string; unit: string }[] = [
  { key: 'V', label: 'Tensión', unit: 'V' },
  { key: 'I', label: 'Intensidad', unit: 'A' },
  { key: 'R', label: 'Resistencia', unit: 'Ω' },
  { key: 'P', label: 'Potencia', unit: 'W' },
]

type Texts = Record<OhmField, string>

function initialTexts(params: URLSearchParams): { texts: Texts; drivers: OhmField[] } {
  const texts: Texts = { V: '230', I: '16', R: '', P: '' }
  const drivers: OhmField[] = []
  for (const field of fields) {
    const raw = params.get(field.key)
    if (raw) {
      texts[field.key] = raw
      drivers.push(field.key)
    }
  }
  return { texts, drivers: drivers.length >= 2 ? drivers.slice(-2) : ['V', 'I'] }
}

export function OhmPage() {
  const [search, setSearch] = useSearchParams()
  const addHistory = useHistory((state) => state.add)
  const [texts, setTexts] = useState(() => initialTexts(search).texts)
  const [drivers, setDrivers] = useState(() => initialTexts(search).drivers)
  const [system, setSystem] = useState<'mono' | 'tri'>(search.get('sys') === 'tri' ? 'tri' : 'mono')
  const [cosPhi, setCosPhi] = useState(search.get('cos') ?? '0,9')

  const known = useMemo(() => {
    const bag: Partial<Record<OhmField, number>> = {}
    for (const key of drivers) {
      const value = parseDecimal(texts[key])
      if (value !== null) bag[key] = value
    }
    return bag
  }, [drivers, texts])
  const solved = solveOhm(known)
  const triangle = useMemo(() => {
    if (!('values' in solved)) return null
    return powerTriangle(system, solved.values.V, solved.values.I, parseDecimal(cosPhi) ?? 1)
  }, [cosPhi, solved, system])

  useEffect(() => {
    const params = new URLSearchParams()
    for (const key of drivers) params.set(key, texts[key])
    params.set('sys', system)
    params.set('cos', cosPhi)
    if (params.toString() !== search.toString()) setSearch(params, { replace: true })
  }, [cosPhi, drivers, search, setSearch, system, texts])

  useEffect(() => {
    if (!('values' in solved)) return
    const href = `/calc/ohm?${search.toString()}`
    const timer = window.setTimeout(() => {
      addHistory({
        kind: 'ohm',
        title: 'Ley de Ohm',
        summary: `${formatNumber(solved.values.V, 2)} V · ${formatNumber(solved.values.I, 2)} A`,
        href,
      })
    }, 800)
    return () => window.clearTimeout(timer)
  }, [addHistory, search, solved])

  function edit(key: OhmField, value: string) {
    setTexts((current) => ({ ...current, [key]: value }))
    setDrivers((current) => [...current.filter((item) => item !== key), key].slice(-2))
  }

  const shown: Texts = { ...texts }
  if ('values' in solved) {
    for (const field of fields) {
      if (!drivers.includes(field.key)) shown[field.key] = formatNumber(solved.values[field.key], 3)
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Ley de Ohm y potencia</h1>
        <p className="mt-2 text-muted">
          Mandan los dos últimos campos que edites. Los otros dos se calculan.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key} className={drivers.includes(field.key) ? '' : 'opacity-80'}>
            <NumberField
              label={`${field.label}${drivers.includes(field.key) ? ' (dato)' : ' (calculado)'}`}
              value={drivers.includes(field.key) ? texts[field.key] : shown[field.key]}
              unit={field.unit}
              onChange={(value) => edit(field.key, value)}
            />
          </div>
        ))}
      </div>
      {'error' in solved ? (
        <p className="text-sm text-red-300 sun:text-red-800">{solved.error}</p>
      ) : (
        <Formula>{solved.formula}</Formula>
      )}
      <section className="rounded-2xl border border-line bg-surface p-4 sun:border-2">
        <h2 className="text-lg font-semibold">Triángulo de potencias</h2>
        <div className="mt-3 flex flex-col gap-3">
          <Segmented
            label="Sistema"
            value={system}
            onChange={setSystem}
            options={[
              { value: 'mono', label: 'Monofásica' },
              { value: 'tri', label: 'Trifásica' },
            ]}
          />
          <NumberField label="cos φ" value={cosPhi} onChange={setCosPhi} />
          {triangle ? (
            <dl className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <dt className="text-muted">P</dt>
                <dd className="font-semibold">{formatNumber(triangle.activeW, 1)} W</dd>
              </div>
              <div>
                <dt className="text-muted">Q</dt>
                <dd className="font-semibold">{formatNumber(triangle.reactiveVar, 1)} var</dd>
              </div>
              <div>
                <dt className="text-muted">S</dt>
                <dd className="font-semibold">{formatNumber(triangle.apparentVa, 1)} VA</dd>
              </div>
            </dl>
          ) : null}
          {triangle ? <Formula>{triangle.formula}</Formula> : null}
        </div>
      </section>
      <ExplainAsDev>
        V, I, R y P son cuatro campos de un mismo registro. Con dos conocidos, el sistema rellena el
        resto: es un objeto con restricciones, no cuatro cajas sueltas. La potencia aparente es el
        módulo del vector; la activa es la parte que hace trabajo y la reactiva, la que se devuelve
        cada ciclo.
      </ExplainAsDev>
      <SafetyBanner />
    </div>
  )
}
