import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ExplainAsDev } from '../../../components/ExplainAsDev.tsx'
import { Formula } from '../../../components/Formula.tsx'
import { NumberField } from '../../../components/NumberField.tsx'
import { SafetyBanner } from '../../../components/SafetyBanner.tsx'
import { Segmented } from '../../../components/Segmented.tsx'
import { StatusBadge } from '../../../components/StatusBadge.tsx'
import { GROUPING, METHODS } from '../../../data/ampacity.ts'
import { VOLTAGE, VOLTAGE_DROP_LIMITS } from '../../../data/constants.ts'
import { circuitById, HOUSING_CIRCUITS } from '../../../data/itcBt25.ts'
import { type CableInput, designCable } from '../../../engine/cable.ts'
import { formatNumber, parseDecimal } from '../../../engine/units.ts'
import { useHistory } from '../../../stores/history.ts'
import { type CableForm, formFromParams, paramsFromForm } from './cableQuery.ts'

const statusText = { ok: 'Dentro de norma', warn: 'Al límite', danger: 'Fuera de norma' } as const

function powerWatts(form: CableForm): number | null {
  const value = parseDecimal(form.power)
  if (value === null) return null
  return form.powerUnit === 'kW' ? value * 1000 : value
}

function toInput(form: CableForm): CableInput {
  const preset = form.preset === 'libre' ? null : circuitById(form.preset)
  return {
    mode: form.mode,
    system: form.system,
    powerW: form.entry === 'power' ? powerWatts(form) : null,
    currentA: form.entry === 'current' ? parseDecimal(form.current) : null,
    cosPhi: parseDecimal(form.cosPhi) ?? 0,
    lengthM: parseDecimal(form.length) ?? 0,
    material: form.material,
    insulation: form.material === 'Al' ? 'XLPE' : form.insulation,
    method: form.method,
    ambientC:
      parseDecimal(form.ambient) ?? (form.method === 'D1' || form.method === 'D2' ? 25 : 40),
    grouping: form.grouping,
    circuits: parseDecimal(form.circuits) ?? 1,
    solar: form.solar,
    protection: form.protection,
    lineId: preset?.lineId ?? form.lineId,
    load: form.load,
    sectionMm2: parseDecimal(form.section),
    minSectionMm2: preset?.sectionMm2 ?? 0,
    fixedBreakerA: preset?.breakerA ?? null,
  }
}

export function CablePage() {
  const [search, setSearch] = useSearchParams()
  const [form, setForm] = useState(() => formFromParams(search))
  const addHistory = useHistory((state) => state.add)
  const result = useMemo(() => designCable(toInput(form)), [form])

  useEffect(() => {
    const next = paramsFromForm(form)
    if (next.toString() !== search.toString()) setSearch(next, { replace: true })
  }, [form, search, setSearch])

  useEffect(() => {
    if (!result.ok || result.sectionFinal === null || result.dropPercent === null) return
    const href = `/calc/seccion?${paramsFromForm(form).toString()}`
    const title = `Cable ${formatNumber(result.sectionFinal, 1)} mm²`
    const summary = `${formatNumber(result.ib, 2)} A · ΔU ${formatNumber(result.dropPercent, 2)} %`
    const timer = window.setTimeout(() => addHistory({ kind: 'cable', title, summary, href }), 800)
    return () => window.clearTimeout(timer)
  }, [addHistory, form, result])

  function patch(partial: Partial<CableForm>) {
    setForm((current) => {
      const next = { ...current, ...partial }
      if (partial.material === 'Al') next.insulation = 'XLPE'
      if (partial.method === 'D1' || partial.method === 'D2') {
        if (current.ambient === '40') next.ambient = '25'
      }
      if (
        (partial.method === 'B1' || partial.method === 'C' || partial.method === 'E') &&
        current.ambient === '25'
      ) {
        next.ambient = '40'
      }
      if (partial.preset && partial.preset !== 'libre') {
        const circuit = circuitById(partial.preset)
        next.lineId = circuit.lineId
        next.cosPhi = '1'
        next.section = String(circuit.sectionMm2).replace('.', ',')
        next.system = 'mono'
        if (circuit.id === 'C13') next.load = 've'
      }
      return next
    })
  }

  const preset = form.preset === 'libre' ? null : circuitById(form.preset)

  return (
    <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">Sección, caída y PIA</h1>
          <p className="mt-2 text-sm text-muted">
            {VOLTAGE.mono} V monofásica y {VOLTAGE.tri} V trifásica. Conductividad a la temperatura
            máxima del aislamiento, no a 20 °C.
          </p>
        </header>
        <Segmented
          label="Modo"
          value={form.mode}
          onChange={(mode) => patch({ mode })}
          options={[
            { value: 'design', label: 'Dimensionar' },
            { value: 'verify', label: 'Verificar' },
          ]}
        />
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Preset</legend>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              aria-pressed={form.preset === 'libre'}
              className={`min-h-12 shrink-0 rounded-xl border px-3 ${form.preset === 'libre' ? 'bg-copper-deep text-white' : 'border-line bg-surface'}`}
              onClick={() => patch({ preset: 'libre' })}
            >
              Libre
            </button>
            {HOUSING_CIRCUITS.map((circuit) => (
              <button
                key={circuit.id}
                type="button"
                aria-pressed={form.preset === circuit.id}
                className={`min-h-12 shrink-0 rounded-xl border px-3 ${form.preset === circuit.id ? 'bg-copper-deep text-white' : 'border-line bg-surface'}`}
                onClick={() => patch({ preset: circuit.id })}
              >
                {circuit.id}
              </button>
            ))}
          </div>
          {preset ? (
            <p className="mt-2 text-sm text-muted">
              {preset.name}. {preset.powerNote ?? `${preset.powerW} W por toma`}. Mínimo de tabla{' '}
              {preset.sectionMm2} mm².
            </p>
          ) : null}
        </fieldset>
        <Segmented
          label="Sistema"
          value={form.system}
          onChange={(system) => patch({ system })}
          options={[
            { value: 'mono', label: 'Monofásica 230 V' },
            { value: 'tri', label: 'Trifásica 400 V' },
          ]}
        />
        <Segmented
          label="Dato de partida"
          value={form.entry}
          onChange={(entry) => patch({ entry })}
          options={[
            { value: 'power', label: 'Potencia' },
            { value: 'current', label: 'Intensidad' },
          ]}
        />
        {form.entry === 'power' ? (
          <>
            <Segmented
              label="Unidad"
              value={form.powerUnit}
              onChange={(powerUnit) => patch({ powerUnit })}
              options={[
                { value: 'W', label: 'W' },
                { value: 'kW', label: 'kW' },
              ]}
            />
            <NumberField
              label="Potencia"
              value={form.power}
              unit={form.powerUnit}
              onChange={(power) => patch({ power })}
            />
          </>
        ) : (
          <NumberField
            label="Intensidad"
            value={form.current}
            unit="A"
            onChange={(current) => patch({ current })}
          />
        )}
        <NumberField
          label="Longitud de la línea"
          value={form.length}
          unit="m"
          hint="Solo la ida, no ida y vuelta."
          onChange={(length) => patch({ length })}
        />
        <NumberField
          label="Factor de potencia"
          value={form.cosPhi}
          hint="En vivienda, con el calibre del PIA, el caso peor es 1."
          onChange={(cosPhi) => patch({ cosPhi })}
        />
        <Segmented
          label="Material"
          value={form.material}
          onChange={(material) => patch({ material })}
          options={[
            { value: 'Cu', label: 'Cobre' },
            { value: 'Al', label: 'Aluminio' },
          ]}
        />
        <Segmented
          label="Aislamiento"
          value={form.material === 'Al' ? 'XLPE' : form.insulation}
          onChange={(insulation) => patch({ insulation })}
          options={[
            { value: 'PVC', label: 'PVC / Z1, 70 °C' },
            { value: 'XLPE', label: 'XLPE, 90 °C' },
          ]}
        />
        <Segmented
          label="Método de instalación"
          value={form.method}
          onChange={(method) => patch({ method })}
          options={Object.entries(METHODS).map(([value, label]) => ({
            value: value as CableForm['method'],
            label: `${value}. ${label}`,
          }))}
        />
        <NumberField
          label="Temperatura ambiente"
          value={form.ambient}
          unit="°C"
          hint="Referencia: 40 °C al aire y 25 °C en terreno."
          onChange={(ambient) => patch({ ambient })}
        />
        <Segmented
          label="Agrupamiento"
          value={form.grouping}
          onChange={(grouping) => patch({ grouping })}
          options={(Object.keys(GROUPING) as CableForm['grouping'][]).map((value) => ({
            value,
            label:
              value === 'bundled'
                ? 'Agrupados'
                : value === 'wallLayer'
                  ? 'Capa en pared'
                  : value === 'ceilingLayer'
                    ? 'Bajo techo'
                    : value === 'perforatedTray'
                      ? 'Bandeja perforada'
                      : 'Bandeja de escalera',
          }))}
        />
        <NumberField
          label="Circuitos agrupados"
          value={form.circuits}
          onChange={(circuits) => patch({ circuits })}
        />
        <button
          type="button"
          aria-pressed={form.solar}
          className={`min-h-12 rounded-xl border px-3 text-left ${form.solar ? 'bg-copper-deep text-white' : 'border-line bg-surface sun:border-2'}`}
          onClick={() => patch({ solar: !form.solar })}
        >
          {form.solar ? 'Al sol: se aplica 0,85' : 'A la sombra'}
        </button>
        <Segmented
          label="Protección"
          value={form.protection}
          onChange={(protection) => patch({ protection })}
          options={[
            { value: 'pia', label: 'PIA' },
            { value: 'gg', label: 'Fusible gG' },
          ]}
        />
        <Segmented
          label="Tipo de línea"
          value={form.lineId}
          onChange={(lineId) => patch({ lineId, preset: 'libre' })}
          options={VOLTAGE_DROP_LIMITS.map((item) => ({
            value: item.id,
            label: `${item.pct} %. ${item.label}`,
          }))}
        />
        <Segmented
          label="Tipo de carga"
          value={form.load}
          onChange={(load) => patch({ load })}
          options={[
            { value: 'resistiva', label: 'Resistiva, curva B' },
            { value: 'general', label: 'General, curva C' },
            { value: 'motor', label: 'Motor ×1,25, curva D' },
            { value: 'descarga', label: 'Descarga ×1,8' },
            { value: 've', label: 'Recarga VE' },
          ]}
        />
        {form.mode === 'verify' ? (
          <NumberField
            label="Sección instalada"
            value={form.section}
            unit="mm²"
            onChange={(section) => patch({ section })}
          />
        ) : null}
      </div>
      <Result form={form} result={result} />
    </div>
  )
}

function Result({ form, result }: { form: CableForm; result: ReturnType<typeof designCable> }) {
  const rcd =
    form.lineId === 've' || form.load === 've'
      ? 'Diferencial de 30 mA clase A como mínimo. En modo 3, añade RDC-DD de 6 mA o usa clase B.'
      : form.load === 'motor'
        ? 'Variador monofásico: diferencial clase F. Trifásico: clase B si lo pide el fabricante.'
        : 'En vivienda, diferencial de 30 mA clase A. Al menos uno por cada cinco circuitos.'

  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
      <section className="rounded-2xl border border-line bg-surface p-4 sun:border-2">
        {!result.ok || result.sectionFinal === null || result.dropPercent === null ? (
          <p className="text-muted">{result.error ?? 'Faltan datos.'}</p>
        ) : (
          <>
            <StatusBadge status={result.status}>{statusText[result.status]}</StatusBadge>
            <p className="mt-4 text-sm text-muted">Sección a instalar</p>
            <p className="text-5xl font-semibold tracking-tight text-copper">
              {formatNumber(result.sectionFinal, 1)} <span className="text-2xl">mm²</span>
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Metric label="Ib" value={`${formatNumber(result.ib, 2)} A`} />
              <Metric label="Para la caída" value={`${formatNumber(result.currentForDrop, 2)} A`} />
              <Metric label="PIA" value={result.breakerA ? `${result.breakerA} A` : '—'} />
              <Metric label="Fusible gG" value={result.fuseA ? `${result.fuseA} A` : '—'} />
              <Metric
                label="Iz corregida"
                value={result.iz ? `${formatNumber(result.iz, 1)} A` : '—'}
              />
              <Metric label="Curva" value={result.curve} />
              <Metric label="Caída" value={`${formatNumber(result.dropVolts ?? 0, 2)} V`} />
              <Metric
                label="Caída"
                value={`${formatNumber(result.dropPercent, 2)} % / ${formatNumber(result.limitPercent, 1)} %`}
              />
              <Metric
                label="Por calentamiento"
                value={
                  result.sectionHeating ? `${formatNumber(result.sectionHeating, 1)} mm²` : '—'
                }
              />
              <Metric
                label="Por caída"
                value={result.sectionDrop ? `${formatNumber(result.sectionDrop, 1)} mm²` : '—'}
              />
              <Metric
                label="Tierra"
                value={result.peMm2 ? `${formatNumber(result.peMm2, 1)} mm²` : '—'}
              />
              <Metric
                label="Longitud máxima"
                value={result.maxLength ? `${formatNumber(result.maxLength, 1)} m` : '—'}
              />
              <Metric
                label="Pérdidas"
                value={result.lossesW ? `${formatNumber(result.lossesW, 1)} W` : '—'}
              />
              <Metric label="γ" value={`${result.conductivity} m/(Ω·mm²)`} />
            </dl>
            <ul className="mt-4 flex flex-col gap-1 text-sm">
              {result.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted">{rcd}</p>
            <p className="mt-1 text-sm text-muted">{result.methodLabel}</p>
          </>
        )}
      </section>
      {result.formula ? <Formula>{result.formula}</Formula> : null}
      <ExplainAsDev>
        La intensidad es el caudal que pide la carga. El PIA es el contrato: no puede prometer más
        de lo que el cable aguanta, Ib ≤ In ≤ Iz. El térmico es un límite de ventana larga y el
        magnético un fail-fast. La caída de tensión es la pérdida de un enlace largo y estrecho. En
        vivienda se calcula con la intensidad del PIA, que es el caso peor, como dimensionar un
        timeout para el pico y no para la media.
      </ExplainAsDev>
      <SafetyBanner compact />
    </aside>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-2 p-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-base font-semibold">{value}</dd>
    </div>
  )
}
