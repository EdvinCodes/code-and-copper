import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ExplainAsDev } from '../../../components/ExplainAsDev.tsx'
import { Note, PageIntro } from '../../../components/Guide.tsx'
import { NumberField } from '../../../components/NumberField.tsx'
import { SafetyBanner } from '../../../components/SafetyBanner.tsx'
import { Segmented } from '../../../components/Segmented.tsx'
import { ShareButton } from '../../../components/ShareButton.tsx'
import { type Status, StatusBadge } from '../../../components/StatusBadge.tsx'
import { Tabs } from '../../../components/Tabs.tsx'
import { REFRIGERANTS } from '../../../data/refrigerants.ts'
import { airDelta, waterDelta } from '../../../engine/deltaT.ts'
import { flowFromPower, instantCop, powerFromFlow } from '../../../engine/hydronic.ts'
import { bandOf, chargeDiagnosis, subcooling, superheat } from '../../../engine/refrigerant.ts'
import { thermalLoad } from '../../../engine/thermalLoad.ts'
import { formatNumber, parseDecimal } from '../../../engine/units.ts'
import { useHistory } from '../../../stores/history.ts'
import { RefrigerantPanel } from '../../cheatsheets/RefrigerantPanel.tsx'
import { type ClimaForm, formFromParams, paramsFromForm } from './climaQuery.ts'

const bandStatus = { ok: 'ok', warn: 'warn', danger: 'danger' } as const satisfies Record<
  string,
  Status
>

function summaryOf(form: ClimaForm): { title: string; summary: string } | null {
  if (form.tab === 'carga') {
    const area = parseDecimal(form.area)
    const height = parseDecimal(form.height)
    if (area === null || height === null) return null
    const result = thermalLoad({
      areaM2: area,
      heightM: height,
      insulation: form.insulation,
      orientation: form.orientation,
      underRoof: form.roof,
      largeWindows: form.windows,
      zone: form.zone,
      people: parseDecimal(form.people) ?? 0,
      equipmentW: parseDecimal(form.equipment) ?? 0,
    })
    return {
      title: `Carga ${formatNumber(result.kw, 2)} kW`,
      summary: `${formatNumber(area, 1)} m² · ${formatNumber(result.fgPerHour, 0)} fg/h`,
    }
  }
  if (form.tab === 'salto') {
    const delta = Math.abs((parseDecimal(form.inlet) ?? 0) - (parseDecimal(form.outlet) ?? 0))
    return { title: `Salto ${formatNumber(delta, 1)} K`, summary: form.deltaMode }
  }
  if (form.tab === 'ciclo') {
    const sh = superheat(
      form.gas,
      parseDecimal(form.suctionP) ?? Number.NaN,
      parseDecimal(form.suctionT) ?? Number.NaN,
    )
    if (sh === null) return null
    return { title: `${form.gas} · SH ${formatNumber(sh, 1)} K`, summary: 'Recalentamiento' }
  }
  if (form.tab === 'caudal') {
    const flow = flowFromPower(parseDecimal(form.power) ?? 0, parseDecimal(form.waterDelta) ?? 0)
    if (flow === null) return null
    return {
      title: `Agua ${formatNumber(flow, 1)} L/min`,
      summary: `${form.power} kW · ΔT ${form.waterDelta} K`,
    }
  }
  return null
}

export function ClimaPage() {
  const [search, setSearch] = useSearchParams()
  const [form, setForm] = useState(() => formFromParams(search))
  const addHistory = useHistory((state) => state.add)
  const entry = useMemo(() => summaryOf(form), [form])

  useEffect(() => {
    const next = paramsFromForm(form)
    if (next.toString() !== search.toString()) setSearch(next, { replace: true })
  }, [form, search, setSearch])

  useEffect(() => {
    if (!entry) return
    const href = `/calc/clima?${paramsFromForm(form).toString()}`
    const timer = window.setTimeout(
      () => addHistory({ kind: 'clima', title: entry.title, summary: entry.summary, href }),
      800,
    )
    return () => window.clearTimeout(timer)
  }, [addHistory, entry, form])

  function patch(partial: Partial<ClimaForm>) {
    setForm((current) => ({ ...current, ...partial }))
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <PageIntro kicker="Aire y agua" title="Si el equipo llega y si está rindiendo">
        <p>
          Primero, una estimación de cuántos vatios de frío pide una habitación. Después, con el
          equipo en marcha, si el aire sale lo bastante más frío que el que entra. No sustituye el
          cálculo completo de un proyecto.
        </p>
      </PageIntro>
      <ShareButton title="Clima · Code & Copper" />
      <Tabs
        value={form.tab}
        onChange={(tab) => patch({ tab })}
        options={[
          { value: 'carga', label: 'Carga' },
          { value: 'salto', label: 'Salto' },
          { value: 'ciclo', label: 'SH / SC' },
          { value: 'caudal', label: 'Agua' },
          { value: 'gases', label: 'Gases' },
        ]}
      />
      <Note>
        {form.tab === 'carga'
          ? 'Metros de la habitación, cómo de bien aislada está y hacia dónde mira. El resultado es una potencia comercial de split, no una factura de ingeniería.'
          : form.tab === 'salto'
            ? 'Mide el aire que entra a la máquina y el que sale. En frío, la diferencia buena de un split anda entre 8 y 14 grados, con el equipo ya estable.'
            : form.tab === 'ciclo'
              ? 'El manómetro dice la presión. Con ella sabes a qué temperatura debería estar el gas. Si la tubería está más caliente o más fría, falta gas, sobra, o no circula.'
              : form.tab === 'caudal'
                ? 'En aerotermia el agua no salta 10 grados como el aire de un split. El diseño suele ser unos 5. Con esa diferencia y la potencia sale el caudal de la bomba.'
                : 'Presión de cada gas, qué diámetro de tubo lleva y cuánto hay que apretar la tuerca. El número definitivo es el del manual de esa máquina.'}
      </Note>
      {form.tab === 'carga' ? <LoadTool form={form} patch={patch} /> : null}
      {form.tab === 'salto' ? <DeltaTool form={form} patch={patch} /> : null}
      {form.tab === 'ciclo' ? <CycleTool form={form} patch={patch} /> : null}
      {form.tab === 'caudal' ? <WaterTool form={form} patch={patch} /> : null}
      {form.tab === 'gases' ? <RefrigerantPanel /> : null}
      <ExplainAsDev>
        El salto térmico es la diferencia entre la entrada y la salida de un intercambiador: si el
        caudal baja, la diferencia sube, igual que una cola que se vacía más despacio de lo que
        entra. En una mezcla con deslizamiento hay dos temperaturas de saturación a la misma
        presión. El recalentamiento usa el rocío y el subenfriamiento, la burbuja.
      </ExplainAsDev>
      <SafetyBanner />
    </div>
  )
}

function LoadTool({
  form,
  patch,
}: {
  form: ClimaForm
  patch: (partial: Partial<ClimaForm>) => void
}) {
  const area = parseDecimal(form.area)
  const height = parseDecimal(form.height)
  const result =
    area === null || height === null
      ? null
      : thermalLoad({
          areaM2: area,
          heightM: height,
          insulation: form.insulation,
          orientation: form.orientation,
          underRoof: form.roof,
          largeWindows: form.windows,
          zone: form.zone,
          people: parseDecimal(form.people) ?? 0,
          equipmentW: parseDecimal(form.equipment) ?? 0,
        })

  return (
    <div className="flex flex-col gap-3">
      <NumberField
        label="Superficie"
        value={form.area}
        unit="m²"
        onChange={(area) => patch({ area })}
      />
      <NumberField
        label="Altura"
        value={form.height}
        unit="m"
        onChange={(height) => patch({ height })}
      />
      <Segmented
        label="Aislamiento"
        value={form.insulation}
        onChange={(insulation) => patch({ insulation })}
        options={[
          { value: 'bueno', label: 'Bueno, 30 W/m³' },
          { value: 'medio', label: 'Medio, 40' },
          { value: 'deficiente', label: 'Deficiente, 50' },
        ]}
      />
      <Segmented
        label="Orientación de la fachada principal"
        value={form.orientation}
        onChange={(orientation) => patch({ orientation })}
        options={(['N', 'E', 'S', 'O'] as const).map((value) => ({ value, label: value }))}
      />
      <Segmented
        label="Zona"
        value={form.zone}
        onChange={(zone) => patch({ zone })}
        options={[
          { value: 'suave', label: 'Suave o costa' },
          { value: 'calurosa', label: 'Calurosa ×1,15' },
        ]}
      />
      <NumberField label="Personas" value={form.people} onChange={(people) => patch({ people })} />
      <NumberField
        label="Equipos internos"
        value={form.equipment}
        unit="W"
        onChange={(equipment) => patch({ equipment })}
      />
      <Toggle on={form.roof} label="Bajo cubierta" onClick={() => patch({ roof: !form.roof })} />
      <Toggle
        on={form.windows}
        label="Grandes ventanales"
        onClick={() => patch({ windows: !form.windows })}
      />
      {result ? (
        <article className="rounded-2xl border border-line bg-surface p-4 sun:border-2">
          <p className="text-4xl font-semibold text-copper">{formatNumber(result.kw, 2)} kW</p>
          <p className="mt-1 text-muted">
            {formatNumber(result.fgPerHour, 0)} fg/h · {formatNumber(result.volumeM3, 1)} m³
          </p>
          <p className="mt-3 font-medium">
            {result.equipmentKw
              ? `Equipo comercial: ${formatNumber(result.equipmentKw, 1)} kW`
              : result.note}
          </p>
        </article>
      ) : null}
    </div>
  )
}

function DeltaTool({
  form,
  patch,
}: {
  form: ClimaForm
  patch: (partial: Partial<ClimaForm>) => void
}) {
  const delta = (parseDecimal(form.inlet) ?? 0) - (parseDecimal(form.outlet) ?? 0)
  const absolute = Math.abs(delta)
  const verdict =
    form.deltaMode === 'aerotermia'
      ? waterDelta(absolute, parseDecimal(form.design) ?? 5)
      : airDelta(form.deltaMode, absolute)

  return (
    <div className="flex flex-col gap-3">
      <Segmented
        label="Equipo"
        value={form.deltaMode}
        onChange={(deltaMode) => patch({ deltaMode })}
        options={[
          { value: 'split-frio', label: 'Split frío' },
          { value: 'split-calor', label: 'Split calor' },
          { value: 'aerotermia', label: 'Aerotermia' },
        ]}
      />
      <NumberField
        label={form.deltaMode === 'split-frio' ? 'Retorno' : 'Entrada o impulsión mayor'}
        value={form.inlet}
        unit="°C"
        onChange={(inlet) => patch({ inlet })}
      />
      <NumberField
        label={form.deltaMode === 'split-frio' ? 'Impulsión' : 'Salida'}
        value={form.outlet}
        unit="°C"
        onChange={(outlet) => patch({ outlet })}
      />
      {form.deltaMode === 'aerotermia' ? (
        <NumberField
          label="ΔT de diseño"
          value={form.design}
          unit="K"
          onChange={(design) => patch({ design })}
        />
      ) : null}
      <article className="rounded-2xl border border-line bg-surface p-4 sun:border-2">
        <StatusBadge status={bandStatus[verdict.band]}>{formatNumber(absolute, 1)} K</StatusBadge>
        <p className="mt-3 text-sm">{verdict.text}</p>
      </article>
    </div>
  )
}

function CycleTool({
  form,
  patch,
}: {
  form: ClimaForm
  patch: (partial: Partial<ClimaForm>) => void
}) {
  const sh = superheat(
    form.gas,
    parseDecimal(form.suctionP) ?? Number.NaN,
    parseDecimal(form.suctionT) ?? Number.NaN,
  )
  const sc = subcooling(
    form.gas,
    parseDecimal(form.liquidP) ?? Number.NaN,
    parseDecimal(form.liquidT) ?? Number.NaN,
  )

  return (
    <div className="flex flex-col gap-3">
      <Segmented
        label="Gas"
        value={form.gas}
        onChange={(gas) => patch({ gas })}
        options={(Object.keys(REFRIGERANTS) as ClimaForm['gas'][]).map((value) => ({
          value,
          label: value,
        }))}
      />
      <NumberField
        label="Baja, manómetro"
        value={form.suctionP}
        unit="bar"
        onChange={(suctionP) => patch({ suctionP })}
      />
      <NumberField
        label="Temperatura de aspiración"
        value={form.suctionT}
        unit="°C"
        onChange={(suctionT) => patch({ suctionT })}
      />
      <NumberField
        label="Alta o líquido"
        value={form.liquidP}
        unit="bar"
        onChange={(liquidP) => patch({ liquidP })}
      />
      <NumberField
        label="Temperatura de líquido"
        value={form.liquidT}
        unit="°C"
        onChange={(liquidT) => patch({ liquidT })}
      />
      <article className="rounded-2xl border border-line bg-surface p-4 text-sm sun:border-2">
        {sh === null || sc === null ? (
          <p>Presión fuera de la tabla (−30 a 60 °C).</p>
        ) : (
          <>
            <p className="flex flex-wrap gap-2">
              <StatusBadge status={bandStatus[bandOf(sh, [5, 10], [3, 15])]}>
                SH {formatNumber(sh, 1)} K
              </StatusBadge>
              <StatusBadge status={bandStatus[bandOf(sc, [3, 8], [1, 12])]}>
                SC {formatNumber(sc, 1)} K
              </StatusBadge>
            </p>
            <p className="mt-3">{chargeDiagnosis(sh, sc)}</p>
            <p className="mt-2 text-muted">
              En mezclas, el SH usa el rocío y el SC la burbuja. Muchos splits solo tienen toma en
              la línea de gas.
            </p>
          </>
        )}
      </article>
    </div>
  )
}

function WaterTool({
  form,
  patch,
}: {
  form: ClimaForm
  patch: (partial: Partial<ClimaForm>) => void
}) {
  const deltaN = parseDecimal(form.waterDelta) ?? 0
  const flowOut = flowFromPower(parseDecimal(form.power) ?? 0, deltaN)
  const powerOut = powerFromFlow(parseDecimal(form.flow) ?? 0, deltaN)
  const cop = instantCop(powerOut, parseDecimal(form.electric) ?? 0)

  return (
    <div className="flex flex-col gap-3">
      <NumberField
        label="Potencia térmica"
        value={form.power}
        unit="kW"
        onChange={(power) => patch({ power })}
      />
      <NumberField
        label="Salto de agua"
        value={form.waterDelta}
        unit="K"
        onChange={(waterDelta) => patch({ waterDelta })}
      />
      <p className="rounded-xl bg-surface p-3">
        Caudal: {flowOut === null ? '—' : `${formatNumber(flowOut, 1)} L/min`}
      </p>
      <NumberField
        label="Caudal medido"
        value={form.flow}
        unit="L/min"
        onChange={(flow) => patch({ flow })}
      />
      <p className="rounded-xl bg-surface p-3">Potencia: {formatNumber(powerOut, 2)} kW</p>
      <NumberField
        label="Potencia eléctrica medida"
        value={form.electric}
        unit="kW"
        onChange={(electric) => patch({ electric })}
      />
      <p className="rounded-xl bg-surface p-3">
        COP instantáneo: {cop === null ? '—' : formatNumber(cop, 2)}
      </p>
    </div>
  )
}

function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      className={`min-h-12 rounded-xl border px-3 text-left ${on ? 'bg-copper-deep text-white' : 'border-line bg-surface sun:border-2'}`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
