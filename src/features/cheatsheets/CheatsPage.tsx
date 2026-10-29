import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { CABLE_TYPES, PE_RULES } from '../../data/cables.ts'
import { CONDUCTOR_COLORS, KNX_COLORS } from '../../data/colors.ts'
import { ELECTRIFICATION, EV_STEPS, HOUSING_CIRCUITS } from '../../data/itcBt25.ts'
import { KNX_FACTS } from '../../data/knx.ts'
import { BOE_REBT, CANARIAS, IN_FORCE, PENDING_RULES } from '../../data/normativa.ts'
import { matchesQuery } from '../../engine/search.ts'
import { RefrigerantPanel } from './RefrigerantPanel.tsx'

export function CheatsPage() {
  const [query, setQuery] = useState('')
  const visible = useMemo(() => {
    const show = (title: string, body: string) => matchesQuery(query, title, body)
    return {
      circuits: show(
        'circuitos vivienda ITC-BT-25 electrificación',
        HOUSING_CIRCUITS.map((item) => item.name).join(' '),
      ),
      colors: show(
        'colores fase neutro tierra cable',
        CONDUCTOR_COLORS.map((item) => item.name).join(' '),
      ),
      cables: show('cables h07 rv-k rz1 halógenos', CABLE_TYPES.map((item) => item.name).join(' ')),
      knx: show('knx bus ets domótica', KNX_FACTS.map((item) => item.title).join(' ')),
      gases: show('gases refrigerante r32 r410a r290 vacío abocardado', 'refrigerante'),
      rules: show('normativa canarias rebt rite boletín', 'decreto trámite'),
    }
  }, [query])
  const any = Object.values(visible).some(Boolean)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Chuletas</h1>
        <p className="mt-2 text-muted">
          Consulta rápida. Los números salen del texto vigente, no de un resumen de memoria.
        </p>
      </header>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar: C4, neutro, KNX, Canarias…"
        className="min-h-12 rounded-xl border border-line bg-surface px-3 sun:border-2"
        aria-label="Buscar en las chuletas"
      />
      {!any ? <p className="text-muted">Nada coincide con esa búsqueda.</p> : null}
      {visible.circuits ? <Circuits /> : null}
      {visible.colors ? <Colors /> : null}
      {visible.cables ? <Cables /> : null}
      {visible.knx ? <Knx /> : null}
      {visible.gases ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold">Gases</h2>
          <RefrigerantPanel />
          <Link to="/calc/clima" className="min-h-12 text-copper">
            Abrir la calculadora de clima
          </Link>
        </section>
      ) : null}
      {visible.rules ? <Rules /> : null}
    </div>
  )
}

function Circuits() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-2xl font-semibold">ITC-BT-25</h2>
      <p className="text-sm text-muted">
        Básica: {ELECTRIFICATION.basica.powerW} W, IGA {ELECTRIFICATION.basica.igaA} A. Elevada:{' '}
        {ELECTRIFICATION.elevada.powerW} W, IGA {ELECTRIFICATION.elevada.igaA} A. Un diferencial de
        30 mA por cada cinco circuitos. La caída interior es del 3 % con la intensidad del PIA.
      </p>
      {HOUSING_CIRCUITS.map((circuit) => (
        <article
          key={circuit.id}
          className="rounded-2xl border border-line bg-surface p-4 sun:border-2"
        >
          <h3 className="font-semibold">
            {circuit.id}. {circuit.name}
          </h3>
          <p className="mt-1 text-sm text-muted">{circuit.take}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-muted">Potencia</dt>
              <dd>{circuit.powerW ? `${circuit.powerW} W` : circuit.powerNote}</dd>
            </div>
            <div>
              <dt className="text-muted">Fs / Fu</dt>
              <dd>
                {circuit.fs ?? '—'} / {circuit.fu ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-muted">PIA</dt>
              <dd>{circuit.breakerA ? `${circuit.breakerA} A` : 'ITC-BT-52'}</dd>
            </div>
            <div>
              <dt className="text-muted">Puntos</dt>
              <dd>{circuit.maxPoints ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted">Sección</dt>
              <dd>{circuit.sectionMm2} mm²</dd>
            </div>
            <div>
              <dt className="text-muted">Tubo</dt>
              <dd>{circuit.tubeMm} mm</dd>
            </div>
          </dl>
          {circuit.notes.map((note) => (
            <p key={note} className="mt-2 text-sm">
              {note}
            </p>
          ))}
        </article>
      ))}
      <article className="rounded-2xl border border-line bg-surface p-4 text-sm sun:border-2">
        <h3 className="font-semibold">Escalones del C13 en unifamiliar</h3>
        <ul className="mt-2 flex flex-col gap-1">
          {EV_STEPS.map((step) => (
            <li key={`${step.system}-${step.breakerA}`}>
              {step.system === 'mono' ? '230 V' : '400 V'} · {step.breakerA} A · {step.powerW} W ·{' '}
              {step.stations} estaciones
            </li>
          ))}
        </ul>
      </article>
    </section>
  )
}

function Colors() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-2xl font-semibold">Colores</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {CONDUCTOR_COLORS.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-2xl border border-line sun:border-2"
          >
            <div
              className="flex h-16 items-end px-3 py-2 font-semibold"
              style={
                item.color === 'stripes'
                  ? {
                      background:
                        'repeating-linear-gradient(135deg, #2E8B57 0 12px, #FFD700 12px 24px)',
                      color: item.ink,
                    }
                  : {
                      background: item.color,
                      color: item.ink,
                      border: item.color === '#111111' ? '1px solid #71717a' : undefined,
                    }
              }
            >
              {item.name}
            </div>
            <p className="p-3 text-sm">{item.rule}</p>
          </article>
        ))}
      </div>
      <h3 className="text-lg font-semibold">Bus KNX</h3>
      <div className="grid gap-2">
        {KNX_COLORS.map((item) => (
          <div
            key={item.role}
            className="flex items-center gap-3 rounded-xl border border-line p-3 sun:border-2"
          >
            <span
              className="size-10 shrink-0 rounded-full border border-line"
              style={{ background: item.color }}
            />
            <p className="text-sm">
              <span className="font-semibold">{item.name}. </span>
              {item.role}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Cables() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-2xl font-semibold">Cables</h2>
      {CABLE_TYPES.map((cable) => (
        <article
          key={cable.id}
          className="rounded-2xl border border-line bg-surface p-4 sun:border-2"
        >
          <h3 className="font-semibold">{cable.name}</h3>
          <p className="text-sm text-copper">
            {cable.temp} · columna {cable.family === 'PVC' ? 'termoplástico' : 'XLPE'}
          </p>
          <p className="mt-2 text-sm">{cable.text}</p>
        </article>
      ))}
      <article className="rounded-2xl border border-line bg-surface p-4 text-sm sun:border-2">
        <h3 className="font-semibold">Conductor de protección</h3>
        <ul className="mt-2 flex flex-col gap-1">
          {PE_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </article>
    </section>
  )
}

function Knx() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-2xl font-semibold">KNX TP1</h2>
      {KNX_FACTS.map((fact) => (
        <article
          key={fact.title}
          className="rounded-2xl border border-line bg-surface p-4 sun:border-2"
        >
          <h3 className="font-semibold">{fact.title}</h3>
          <p className="mt-1 text-sm">{fact.text}</p>
        </article>
      ))}
    </section>
  )
}

function Rules() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-2xl font-semibold">Normativa</h2>
      <a className="text-copper" href={BOE_REBT} target="_blank" rel="noreferrer">
        Texto consolidado del REBT en el BOE
      </a>
      {IN_FORCE.map((item) => (
        <article
          key={item.name}
          className="rounded-2xl border border-line bg-surface p-4 sun:border-2"
        >
          <h3 className="font-semibold">{item.name}</h3>
          <p className="mt-1 text-sm">{item.detail}</p>
        </article>
      ))}
      <h3 className="text-lg font-semibold text-amber-300 sun:text-amber-800">
        En tramitación, no vigente
      </h3>
      {PENDING_RULES.map((item) => (
        <article
          key={item.name}
          className="rounded-2xl border border-amber-700 bg-amber-950/40 p-4 sun:border-2 sun:bg-amber-50"
        >
          <h3 className="font-semibold">{item.name}</h3>
          <p className="mt-1 text-sm">{item.detail}</p>
        </article>
      ))}
      <h3 className="text-lg font-semibold">Canarias</h3>
      {CANARIAS.map((item) => (
        <article
          key={item.name}
          className="rounded-2xl border border-line bg-surface p-4 sun:border-2"
        >
          <h3 className="font-semibold">{item.name}</h3>
          <p className="mt-1 text-sm">{item.detail}</p>
          {'href' in item && item.href ? (
            <a
              className="mt-2 inline-flex min-h-12 items-center text-copper"
              href={item.href}
              target="_blank"
              rel="noreferrer"
            >
              Abrir el trámite
            </a>
          ) : null}
        </article>
      ))}
    </section>
  )
}
