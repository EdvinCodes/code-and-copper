import { useMemo, useState } from 'react'
import { ExplainAsDev } from '../../../components/ExplainAsDev.tsx'
import { NumberField } from '../../../components/NumberField.tsx'
import { SafetyBanner } from '../../../components/SafetyBanner.tsx'
import { Segmented } from '../../../components/Segmented.tsx'
import { ShareButton } from '../../../components/ShareButton.tsx'
import { type Status, StatusBadge } from '../../../components/StatusBadge.tsx'
import { Tabs } from '../../../components/Tabs.tsx'
import { type GasId, REFRIGERANTS } from '../../../data/refrigerants.ts'
import { airDelta, waterDelta } from '../../../engine/deltaT.ts'
import { flowFromPower, instantCop, powerFromFlow } from '../../../engine/hydronic.ts'
import { bandOf, chargeDiagnosis, subcooling, superheat } from '../../../engine/refrigerant.ts'
import {
  type ClimateZone,
  type InsulationLevel,
  type Orientation,
  thermalLoad,
} from '../../../engine/thermalLoad.ts'
import { formatNumber, parseDecimal } from '../../../engine/units.ts'
import { RefrigerantPanel } from '../../cheatsheets/RefrigerantPanel.tsx'

type Tab = 'carga' | 'salto' | 'ciclo' | 'caudal' | 'gases'
const bandStatus = { ok: 'ok', warn: 'warn', danger: 'danger' } as const satisfies Record<
  string,
  Status
>

export function ClimaPage() {
  const [tab, setTab] = useState<Tab>('carga')
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Clima y frigorista</h1>
        <p className="mt-2 text-muted">
          Estimaciones de campo. La carga no sustituye un cálculo de cargas del RITE.
        </p>
        <div className="mt-3">
          <ShareButton title="Clima · Code & Copper" />
        </div>
      </header>
      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          { value: 'carga', label: 'Carga' },
          { value: 'salto', label: 'Salto' },
          { value: 'ciclo', label: 'SH / SC' },
          { value: 'caudal', label: 'Agua' },
          { value: 'gases', label: 'Gases' },
        ]}
      />
      {tab === 'carga' ? <LoadTool /> : null}
      {tab === 'salto' ? <DeltaTool /> : null}
      {tab === 'ciclo' ? <CycleTool /> : null}
      {tab === 'caudal' ? <WaterTool /> : null}
      {tab === 'gases' ? <RefrigerantPanel /> : null}
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

function LoadTool() {
  const [area, setArea] = useState('20')
  const [height, setHeight] = useState('2,6')
  const [insulation, setInsulation] = useState<InsulationLevel>('medio')
  const [orientation, setOrientation] = useState<Orientation>('S')
  const [zone, setZone] = useState<ClimateZone>('suave')
  const [people, setPeople] = useState('2')
  const [equipment, setEquipment] = useState('0')
  const [roof, setRoof] = useState(false)
  const [windows, setWindows] = useState(false)
  const result = useMemo(() => {
    const areaM2 = parseDecimal(area)
    const heightM = parseDecimal(height)
    if (areaM2 === null || heightM === null) return null
    return thermalLoad({
      areaM2,
      heightM,
      insulation,
      orientation,
      underRoof: roof,
      largeWindows: windows,
      zone,
      people: parseDecimal(people) ?? 0,
      equipmentW: parseDecimal(equipment) ?? 0,
    })
  }, [area, equipment, height, insulation, orientation, people, roof, windows, zone])

  return (
    <div className="flex flex-col gap-3">
      <NumberField label="Superficie" value={area} unit="m²" onChange={setArea} />
      <NumberField label="Altura" value={height} unit="m" onChange={setHeight} />
      <Segmented
        label="Aislamiento"
        value={insulation}
        onChange={setInsulation}
        options={[
          { value: 'bueno', label: 'Bueno, 30 W/m³' },
          { value: 'medio', label: 'Medio, 40' },
          { value: 'deficiente', label: 'Deficiente, 50' },
        ]}
      />
      <Segmented
        label="Orientación de la fachada principal"
        value={orientation}
        onChange={setOrientation}
        options={['N', 'E', 'S', 'O'].map((value) => ({
          value: value as Orientation,
          label: value,
        }))}
      />
      <Segmented
        label="Zona"
        value={zone}
        onChange={setZone}
        options={[
          { value: 'suave', label: 'Suave o costa' },
          { value: 'calurosa', label: 'Calurosa ×1,15' },
        ]}
      />
      <NumberField label="Personas" value={people} onChange={setPeople} />
      <NumberField label="Equipos internos" value={equipment} unit="W" onChange={setEquipment} />
      <Toggle on={roof} label="Bajo cubierta" onClick={() => setRoof((value) => !value)} />
      <Toggle
        on={windows}
        label="Grandes ventanales"
        onClick={() => setWindows((value) => !value)}
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

function DeltaTool() {
  const [mode, setMode] = useState<'split-frio' | 'split-calor' | 'aerotermia'>('split-frio')
  const [inlet, setInlet] = useState('24')
  const [outlet, setOutlet] = useState('14')
  const [design, setDesign] = useState('5')
  const delta = (parseDecimal(inlet) ?? 0) - (parseDecimal(outlet) ?? 0)
  const absolute = Math.abs(delta)
  const verdict =
    mode === 'aerotermia'
      ? waterDelta(absolute, parseDecimal(design) ?? 5)
      : airDelta(mode, absolute)

  return (
    <div className="flex flex-col gap-3">
      <Segmented
        label="Equipo"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'split-frio', label: 'Split frío' },
          { value: 'split-calor', label: 'Split calor' },
          { value: 'aerotermia', label: 'Aerotermia' },
        ]}
      />
      <NumberField
        label={mode === 'split-frio' ? 'Retorno' : 'Entrada o impulsión mayor'}
        value={inlet}
        unit="°C"
        onChange={setInlet}
      />
      <NumberField
        label={mode === 'split-frio' ? 'Impulsión' : 'Salida'}
        value={outlet}
        unit="°C"
        onChange={setOutlet}
      />
      {mode === 'aerotermia' ? (
        <NumberField label="ΔT de diseño" value={design} unit="K" onChange={setDesign} />
      ) : null}
      <article className="rounded-2xl border border-line bg-surface p-4 sun:border-2">
        <StatusBadge status={bandStatus[verdict.band]}>{formatNumber(absolute, 1)} K</StatusBadge>
        <p className="mt-3 text-sm">{verdict.text}</p>
      </article>
    </div>
  )
}

function CycleTool() {
  const [gas, setGas] = useState<GasId>('R32')
  const [suctionP, setSuctionP] = useState('8,5')
  const [suctionT, setSuctionT] = useState('12')
  const [liquidP, setLiquidP] = useState('26,32')
  const [liquidT, setLiquidT] = useState('40')
  const sh = superheat(
    gas,
    parseDecimal(suctionP) ?? Number.NaN,
    parseDecimal(suctionT) ?? Number.NaN,
  )
  const sc = subcooling(
    gas,
    parseDecimal(liquidP) ?? Number.NaN,
    parseDecimal(liquidT) ?? Number.NaN,
  )

  return (
    <div className="flex flex-col gap-3">
      <Segmented
        label="Gas"
        value={gas}
        onChange={setGas}
        options={(Object.keys(REFRIGERANTS) as GasId[]).map((value) => ({ value, label: value }))}
      />
      <NumberField label="Baja, manómetro" value={suctionP} unit="bar" onChange={setSuctionP} />
      <NumberField
        label="Temperatura de aspiración"
        value={suctionT}
        unit="°C"
        onChange={setSuctionT}
      />
      <NumberField label="Alta o líquido" value={liquidP} unit="bar" onChange={setLiquidP} />
      <NumberField label="Temperatura de líquido" value={liquidT} unit="°C" onChange={setLiquidT} />
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

function WaterTool() {
  const [power, setPower] = useState('8')
  const [delta, setDelta] = useState('5')
  const [flow, setFlow] = useState('20')
  const [electric, setElectric] = useState('2')
  const deltaN = parseDecimal(delta) ?? 0
  const flowOut = flowFromPower(parseDecimal(power) ?? 0, deltaN)
  const powerOut = powerFromFlow(parseDecimal(flow) ?? 0, deltaN)
  const cop = instantCop(powerOut, parseDecimal(electric) ?? 0)

  return (
    <div className="flex flex-col gap-3">
      <NumberField label="Potencia térmica" value={power} unit="kW" onChange={setPower} />
      <NumberField label="Salto de agua" value={delta} unit="K" onChange={setDelta} />
      <p className="rounded-xl bg-surface p-3">
        Caudal: {flowOut === null ? '—' : `${formatNumber(flowOut, 1)} L/min`}
      </p>
      <NumberField label="Caudal medido" value={flow} unit="L/min" onChange={setFlow} />
      <p className="rounded-xl bg-surface p-3">Potencia: {formatNumber(powerOut, 2)} kW</p>
      <NumberField
        label="Potencia eléctrica medida"
        value={electric}
        unit="kW"
        onChange={setElectric}
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
