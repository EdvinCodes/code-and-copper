import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ExplainAsDev } from '../../../components/ExplainAsDev.tsx'
import { Formula } from '../../../components/Formula.tsx'
import { Note, PageIntro, Step, UnitCards } from '../../../components/Guide.tsx'
import { NumberField } from '../../../components/NumberField.tsx'
import { SafetyBanner } from '../../../components/SafetyBanner.tsx'
import { Segmented } from '../../../components/Segmented.tsx'
import { ShareButton } from '../../../components/ShareButton.tsx'
import { StatusBadge } from '../../../components/StatusBadge.tsx'
import { GROUPING, METHODS } from '../../../data/ampacity.ts'
import { VOLTAGE, VOLTAGE_DROP_LIMITS } from '../../../data/constants.ts'
import { circuitById, HOUSING_CIRCUITS } from '../../../data/itcBt25.ts'
import { type CableInput, designCable } from '../../../engine/cable.ts'
import { formatNumber, parseDecimal } from '../../../engine/units.ts'
import { useHistory } from '../../../stores/history.ts'
import { type CableForm, formFromParams, paramsFromForm } from './cableQuery.ts'

const statusText = {
  ok: 'Se puede hacer así',
  warn: 'Vas justo',
  danger: 'No lo dejes así',
} as const

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
      <div className="flex min-w-0 flex-col gap-4">
        <PageIntro kicker="Qué cable poner" title="Sección, caída y automático">
          <p>
            Sirve para saber el grosor del cable y el automático que lo protege. Un cable fino en
            una línea larga se calienta y, además, al final llega menos tensión de la que salió del
            cuadro.
          </p>
          <UnitCards />
        </PageIntro>
        <ShareButton title="Sección de cable · Code & Copper" />
        <Step n={1} title="Qué vas a alimentar">
          <Note>
            En una vivienda los circuitos ya tienen nombre: C1 son las luces, C2 los enchufes
            normales, C3 la cocina. Elige uno y la calculadora rellena lo que pide la norma. «Libre»
            es cuando no es un circuito de casa.
          </Note>
          <div className="grid min-w-0 grid-cols-2 gap-2">
            <button
              type="button"
              aria-pressed={form.preset === 'libre'}
              className={`min-h-16 rounded-xl border px-3 text-left ${form.preset === 'libre' ? 'border-copper bg-copper-deep text-white' : 'border-line bg-surface'}`}
              onClick={() => patch({ preset: 'libre' })}
            >
              <span className="block font-semibold">Libre</span>
              <span className="block text-sm opacity-80">Yo pongo los datos</span>
            </button>
            {HOUSING_CIRCUITS.map((circuit) => (
              <button
                key={circuit.id}
                type="button"
                aria-pressed={form.preset === circuit.id}
                className={`min-h-16 rounded-xl border px-3 text-left ${form.preset === circuit.id ? 'border-copper bg-copper-deep text-white' : 'border-line bg-surface'}`}
                onClick={() => patch({ preset: circuit.id })}
              >
                <span className="block font-semibold">{circuit.id}</span>
                <span className="block text-sm opacity-80">{circuit.name}</span>
              </button>
            ))}
          </div>
          <Note>
            {preset
              ? `${preset.name}. ${preset.powerNote ?? `La norma cuenta ${preset.powerW} W en cada toma.`} Cable mínimo ${preset.sectionMm2} mm²${preset.breakerA ? ` y automático de ${preset.breakerA} A` : ''}.`
              : 'Sin circuito de vivienda. Tú indicas la potencia, los metros y si es alumbrado, fuerza o el coche.'}
          </Note>
          <Segmented
            label="Qué quieres saber"
            value={form.mode}
            onChange={(mode) => patch({ mode })}
            options={[
              { value: 'design', label: 'Qué comprar' },
              { value: 'verify', label: 'Si lo instalado vale' },
            ]}
          />
        </Step>
        <Step n={2} title="Una fase o tres">
          <Note>
            Monofásica es lo normal de un piso: una fase y el neutro, {VOLTAGE.mono} V. Trifásica
            son tres fases, {VOLTAGE.tri} V entre ellas. La ves en talleres, comunidades y en
            algunos cargadores de coche o aerotermias grandes. Si dudas en una vivienda, es
            monofásica.
          </Note>
          <Segmented
            label="Tipo de suministro"
            value={form.system}
            onChange={(system) => patch({ system })}
            options={[
              { value: 'mono', label: `Piso, ${VOLTAGE.mono} V` },
              { value: 'tri', label: `Taller, ${VOLTAGE.tri} V` },
            ]}
          />
        </Step>
        <Step n={3} title="Cuánto consume y qué lejos está">
          <Note>
            La potencia (W) sale de la pegatina del aparato. 1000 W son 1 kW. La intensidad (A) es
            la corriente: si ya la tienes medida con la pinza, úsala. La longitud es solo la ida,
            desde el cuadro hasta el aparato, en metros.
          </Note>
          <Segmented
            label="Qué dato tienes"
            value={form.entry}
            onChange={(entry) => patch({ entry })}
            options={[
              { value: 'power', label: 'Potencia, W' },
              { value: 'current', label: 'Corriente, A' },
            ]}
          />
          {form.entry === 'power' ? (
            <>
              <Segmented
                label="Unidad"
                value={form.powerUnit}
                onChange={(powerUnit) => patch({ powerUnit })}
                options={[
                  { value: 'W', label: 'Vatios' },
                  { value: 'kW', label: 'Kilovatios' },
                ]}
              />
              <NumberField
                label="Potencia"
                value={form.power}
                unit={form.powerUnit}
                hint="Ejemplo: un horno suele estar entre 2000 y 3500 W."
                onChange={(power) => patch({ power })}
              />
            </>
          ) : (
            <NumberField
              label="Corriente"
              value={form.current}
              unit="A"
              hint="Es lo que marca la pinza amperimétrica con el aparato en marcha."
              onChange={(current) => patch({ current })}
            />
          )}
          <NumberField
            label="Metros de cable, solo la ida"
            value={form.length}
            unit="m"
            onChange={(length) => patch({ length })}
          />
          {form.mode === 'verify' ? (
            <NumberField
              label="Cable que ya está puesto"
              value={form.section}
              unit="mm²"
              hint="El grosor escrito en la cubierta: 1,5, 2,5, 4, 6…"
              onChange={(section) => patch({ section })}
            />
          ) : null}
        </Step>
        <details className="panel min-w-0 p-4">
          <summary className="min-h-12 cursor-pointer text-lg font-semibold">
            Cómo va instalado el cable
          </summary>
          <div className="mt-3 flex flex-col gap-3">
            <Note>
              Si no tocas esto, se calcula como un cable de cobre bajo tubo en una pared, a la
              sombra y a 40 °C. Es el caso habitual de una vivienda.
            </Note>
            <NumberField
              label="Factor de potencia"
              value={form.cosPhi}
              hint="Déjalo en 0,9 si no lo conoces. En un circuito de vivienda, la norma usa 1 porque es el caso en el que más tensión se pierde."
              onChange={(cosPhi) => patch({ cosPhi })}
            />
            <Segmented
              label="De qué es el cable"
              value={form.material}
              onChange={(material) => patch({ material })}
              options={[
                { value: 'Cu', label: 'Cobre, lo normal' },
                { value: 'Al', label: 'Aluminio' },
              ]}
            />
            <Segmented
              label="Hasta qué temperatura aguanta el aislante"
              value={form.material === 'Al' ? 'XLPE' : form.insulation}
              onChange={(insulation) => patch({ insulation })}
              options={[
                { value: 'PVC', label: 'PVC o Z1, 70 °C' },
                { value: 'XLPE', label: 'XLPE, 90 °C' },
              ]}
            />
            <Segmented
              label="Por dónde pasa"
              value={form.method}
              onChange={(method) => patch({ method })}
              options={Object.entries(METHODS).map(([value, label]) => ({
                value: value as CableForm['method'],
                label: `${value}. ${label}`,
              }))}
            />
            <NumberField
              label="Temperatura del sitio"
              value={form.ambient}
              unit="°C"
              hint="40 °C si va por dentro. 25 °C si el tubo va enterrado."
              onChange={(ambient) => patch({ ambient })}
            />
            <Segmented
              label="Va solo o junto a otros cables"
              value={form.grouping}
              onChange={(grouping) => patch({ grouping })}
              options={(Object.keys(GROUPING) as CableForm['grouping'][]).map((value) => ({
                value,
                label:
                  value === 'bundled'
                    ? 'Juntos en el mismo tubo'
                    : value === 'wallLayer'
                      ? 'En fila sobre la pared'
                      : value === 'ceilingLayer'
                        ? 'Bajo el techo'
                        : value === 'perforatedTray'
                          ? 'Bandeja perforada'
                          : 'Bandeja de escalera',
              }))}
            />
            <NumberField
              label="Cuántos circuitos van juntos"
              value={form.circuits}
              hint="Si van varios cables cargados en el mismo tubo, cada uno aguanta menos."
              onChange={(circuits) => patch({ circuits })}
            />
            <button
              type="button"
              aria-pressed={form.solar}
              className={`min-h-12 rounded-xl border px-3 text-left ${form.solar ? 'bg-copper-deep text-white' : 'border-line bg-surface sun:border-2'}`}
              onClick={() => patch({ solar: !form.solar })}
            >
              {form.solar ? 'Le da el sol directo' : 'Va a la sombra'}
            </button>
            <Segmented
              label="Qué lo protege"
              value={form.protection}
              onChange={(protection) => patch({ protection })}
              options={[
                { value: 'pia', label: 'Automático del cuadro' },
                { value: 'gg', label: 'Fusible' },
              ]}
            />
            <Segmented
              label="Qué límite de caída usar"
              value={form.lineId}
              onChange={(lineId) => patch({ lineId, preset: 'libre' })}
              options={VOLTAGE_DROP_LIMITS.map((item) => ({
                value: item.id,
                label: `${item.pct} %. ${item.label}`,
              }))}
            />
            <Segmented
              label="Qué tipo de aparato es"
              value={form.load}
              onChange={(load) => patch({ load })}
              options={[
                { value: 'resistiva', label: 'Resistencia o luces' },
                { value: 'general', label: 'Uso general' },
                { value: 'motor', label: 'Motor' },
                { value: 'descarga', label: 'Lámparas de descarga' },
                { value: 've', label: 'Cargador de coche' },
              ]}
            />
          </div>
        </details>
      </div>
      <Result form={form} result={result} />
    </div>
  )
}

function Result({ form, result }: { form: CableForm; result: ReturnType<typeof designCable> }) {
  const rcd =
    form.lineId === 've' || form.load === 've'
      ? 'El cargador lleva su propio diferencial, el interruptor que corta si hay una fuga a tierra. Tiene que ser de 30 mA y de clase A. Si el cargador no vigila la corriente continua, hace falta uno de clase B.'
      : form.load === 'motor'
        ? 'Un motor con variador ensucia la corriente. El diferencial de casa, el normal, a veces no lo ve o salta sin motivo. Pregunta al fabricante del equipo cuál pide.'
        : 'Además del automático, el circuito de casa lleva un diferencial de 30 mA: corta si la corriente se escapa a tierra. Uno vale para cinco circuitos como máximo.'

  const story =
    result.ok && result.sectionFinal !== null && result.dropPercent !== null
      ? `Usa cable de ${formatNumber(result.sectionFinal, 1)} mm² y un automático de ${result.breakerA ?? '—'} A. Por el camino se pierden ${formatNumber(result.dropPercent, 2)} % de la tensión, y el máximo aquí es ${formatNumber(result.limitPercent, 1)} %.`
      : null

  return (
    <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
      <section className="panel p-4">
        {!result.ok || result.sectionFinal === null || result.dropPercent === null ? (
          <p className="text-muted">{result.error ?? 'Faltan datos para calcular.'}</p>
        ) : (
          <>
            <StatusBadge status={result.status}>{statusText[result.status]}</StatusBadge>
            <p className="mt-4 text-base leading-relaxed">{story}</p>
            <p className="mt-4 text-sm text-muted">Grosor del cable</p>
            <p className="text-5xl font-semibold tracking-tight text-copper">
              {formatNumber(result.sectionFinal, 1)} <span className="text-2xl">mm²</span>
            </p>
            <p className="mt-2 text-sm text-muted">
              El automático (PIA) es el interruptor pequeño de ese circuito. Corta si hay un
              cortocircuito o si enchufas más de lo que el cable aguanta.
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Metric label="Corriente que pide" value={`${formatNumber(result.ib, 2)} A`} />
              <Metric
                label="Automático"
                value={result.breakerA ? `${result.breakerA} A, curva ${result.curve}` : '—'}
              />
              <Metric
                label="Lo que aguanta el cable"
                value={result.iz ? `${formatNumber(result.iz, 1)} A` : '—'}
              />
              <Metric
                label="Tensión que se pierde"
                value={`${formatNumber(result.dropVolts ?? 0, 2)} V`}
              />
              <Metric
                label="Por calor, mínimo"
                value={
                  result.sectionHeating ? `${formatNumber(result.sectionHeating, 1)} mm²` : '—'
                }
              />
              <Metric
                label="Por distancia, mínimo"
                value={result.sectionDrop ? `${formatNumber(result.sectionDrop, 1)} mm²` : '—'}
              />
              <Metric
                label="Cable de tierra"
                value={result.peMm2 ? `${formatNumber(result.peMm2, 1)} mm²` : '—'}
              />
              <Metric
                label="Hasta dónde llega este cable"
                value={result.maxLength ? `${formatNumber(result.maxLength, 1)} m` : '—'}
              />
            </dl>
            <p className="mt-3 text-sm leading-relaxed text-muted">{rcd}</p>
            <p className="mt-2 text-sm text-muted">Instalación supuesta: {result.methodLabel}.</p>
            <details className="mt-3 text-sm">
              <summary className="min-h-12 cursor-pointer font-medium">
                Por qué sale este aviso
              </summary>
              <ul className="mt-2 flex flex-col gap-1 text-muted">
                {result.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </details>
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
