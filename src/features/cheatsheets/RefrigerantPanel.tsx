import { useMemo, useState } from 'react'
import { Formula } from '../../components/Formula.tsx'
import { NumberField } from '../../components/NumberField.tsx'
import { Segmented } from '../../components/Segmented.tsx'
import {
  BAR_TO_PSI,
  FGAS_CALENDAR,
  FLARE_TORQUE,
  type GasId,
  PIPES,
  PT_TEMPS,
  REFRIGERANTS,
  VACUUM_STEPS,
} from '../../data/refrigerants.ts'
import { saturationPressure, saturationTemperature } from '../../engine/refrigerant.ts'
import { formatNumber, parseDecimal } from '../../engine/units.ts'

const gases = Object.keys(REFRIGERANTS) as GasId[]

export function RefrigerantPanel() {
  const [gas, setGas] = useState<GasId>('R32')
  const [temp, setTemp] = useState('7')
  const [pressure, setPressure] = useState('8,5')
  const [unit, setUnit] = useState<'rel' | 'abs' | 'psi'>('rel')
  const info = REFRIGERANTS[gas]
  const zeotropic = 'bubble' in info

  const fromTemp = useMemo(() => {
    const value = parseDecimal(temp)
    if (value === null) return null
    const dew = saturationPressure(gas, value, 'dew')
    const bubble = saturationPressure(gas, value, 'bubble')
    return { dew, bubble }
  }, [gas, temp])

  const fromPressure = useMemo(() => {
    const raw = parseDecimal(pressure)
    if (raw === null) return null
    const rel = unit === 'rel' ? raw : unit === 'abs' ? raw - 1.01325 : raw / BAR_TO_PSI
    return {
      rel,
      dew: saturationTemperature(gas, rel, 'dew'),
      bubble: saturationTemperature(gas, rel, 'bubble'),
    }
  }, [gas, pressure, unit])

  return (
    <div className="flex flex-col gap-4">
      <Segmented
        label="Refrigerante"
        value={gas}
        onChange={setGas}
        options={gases.map((id) => ({ value: id, label: id }))}
      />
      <article className="rounded-2xl border border-line bg-surface p-4 sun:border-2">
        <h2 className="text-xl font-semibold">{info.name}</h2>
        <p className="mt-1 text-sm text-muted">
          {info.kind}. PCA {info.gwp}. Seguridad {info.safety}. Deslizamiento{' '}
          {formatNumber(info.glide, 1)} K.
        </p>
        <p className="mt-2 text-sm">{info.note}</p>
      </article>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Temperatura de saturación" value={temp} unit="°C" onChange={setTemp} />
        <div className="rounded-2xl border border-line bg-surface p-4 sun:border-2">
          {fromTemp?.dew === null || fromTemp === null ? (
            <p className="text-sm text-muted">Fuera de tabla (−30 a 60 °C).</p>
          ) : (
            <p className="text-lg font-semibold">
              {zeotropic
                ? `Burbuja ${formatNumber(fromTemp.bubble ?? 0, 2)} bar · Rocío ${formatNumber(fromTemp.dew, 2)} bar`
                : `${formatNumber(fromTemp.dew, 2)} bar rel · ${formatNumber((fromTemp.dew + 1.01325) * BAR_TO_PSI, 1)} psi`}
            </p>
          )}
        </div>
        <NumberField label="Presión leída" value={pressure} onChange={setPressure} />
        <Segmented
          label="Unidad de presión"
          value={unit}
          onChange={setUnit}
          options={[
            { value: 'rel', label: 'bar rel' },
            { value: 'abs', label: 'bar abs' },
            { value: 'psi', label: 'psi' },
          ]}
        />
      </div>
      {fromPressure ? (
        <Formula>
          {fromPressure.dew === null
            ? 'Esa presión queda fuera de la tabla.'
            : zeotropic
              ? `${formatNumber(fromPressure.rel, 2)} bar rel → rocío ${formatNumber(fromPressure.dew, 1)} °C, burbuja ${formatNumber(fromPressure.bubble ?? 0, 1)} °C`
              : `${formatNumber(fromPressure.rel, 2)} bar rel → ${formatNumber(fromPressure.dew, 1)} °C`}
        </Formula>
      ) : null}
      <div className="overflow-x-auto rounded-2xl border border-line sun:border-2">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead className="bg-surface">
            <tr>
              <th className="p-3">°C</th>
              {zeotropic ? (
                <>
                  <th className="p-3">Burbuja</th>
                  <th className="p-3">Rocío</th>
                </>
              ) : (
                <th className="p-3">bar rel</th>
              )}
            </tr>
          </thead>
          <tbody>
            {PT_TEMPS.map((degree, index) => (
              <tr key={degree} className="border-t border-line">
                <td className="p-3">{degree}</td>
                {zeotropic ? (
                  <>
                    <td className="p-3">{info.bubble[index]}</td>
                    <td className="p-3">{info.dew[index]}</td>
                  </>
                ) : (
                  <td className="p-3">{info.p[index]}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section>
        <h2 className="text-lg font-semibold">Calendario F-gas</h2>
        <p className="mt-1 text-sm text-muted">
          Prohíbe comercializar equipos nuevos. Los ya instalados se pueden mantener. Hay excepción
          si la seguridad del local no permite el refrigerante de menor PCA.
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {FGAS_CALENDAR.map((item) => (
            <li
              key={item.date}
              className="rounded-xl border border-line bg-surface p-3 text-sm sun:border-2"
            >
              <span className="font-semibold text-copper">{item.date}. </span>
              {item.text}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Tubería y par de apriete</h2>
        <p className="mt-1 text-sm text-muted">
          No hay un par universal. La franja común es donde coinciden los manuales cotejados. Manda
          el del equipo que estás montando.
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {PIPES.map((pipe) => (
            <li
              key={pipe.inch}
              className="rounded-xl border border-line bg-surface p-3 text-sm sun:border-2"
            >
              {pipe.inch} · {formatNumber(pipe.mm, 2)} mm · tuerca {pipe.nut} mm
            </li>
          ))}
        </ul>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr>
                {['Tubo', 'Daikin', 'MSZ-AP', 'PUZ-ZM', 'Fujitsu', 'Toshiba', 'Común'].map(
                  (head) => (
                    <th key={head} className="p-2">
                      {head}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {FLARE_TORQUE.map((row) => (
                <tr key={row.inch} className="border-t border-line">
                  <td className="p-2">{row.inch}</td>
                  <td className="p-2">{row.daikin}</td>
                  <td className="p-2">{row.msz}</td>
                  <td className="p-2">{row.puz}</td>
                  <td className="p-2">{row.fujitsu}</td>
                  <td className="p-2">{row.toshiba}</td>
                  <td className="p-2 font-semibold">{row.common}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Nitrógeno y vacío</h2>
        <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm">
          {VACUUM_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
    </div>
  )
}
