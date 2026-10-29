import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { SafetyBanner } from '../../components/SafetyBanner.tsx'
import { AC_START, AC_TREE } from '../../data/diagnostics/ac.ts'
import { BREAKER, BREAKER_START } from '../../data/diagnostics/breaker.ts'
import { DIFFERENTIAL, DIFFERENTIAL_START } from '../../data/diagnostics/differential.ts'
import type { WizardNode } from '../../engine/wizard.ts'

const CASES = [
  {
    id: 'diferencial',
    title: 'Salta el diferencial',
    start: DIFFERENTIAL_START,
    nodes: DIFFERENTIAL,
  },
  { id: 'magnetotermico', title: 'Salta el PIA o el IGA', start: BREAKER_START, nodes: BREAKER },
  { id: 'aire', title: 'El aire no enfría', start: AC_START, nodes: AC_TREE },
] as const

const GOLDEN = [
  'Desconectar.',
  'Prevenir la realimentación: bloqueo y señal.',
  'Verificar ausencia de tensión con detector bipolar.',
  'Puesta a tierra y en cortocircuito, cuando proceda.',
  'Señalizar y delimitar la zona.',
]

export function DiagnosticPage() {
  const { caso } = useParams()
  const selected = CASES.find((item) => item.id === caso)
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Diagnóstico</h1>
        <p className="mt-2 text-muted">
          Un paso cada vez. Atrás no cambia la instalación: solo deshace la última respuesta.
        </p>
      </header>
      <article className="rounded-2xl border border-amber-700 bg-amber-950/40 p-4 sun:border-2 sun:bg-amber-50">
        <h2 className="font-semibold">Cinco reglas antes de medir sin tensión</h2>
        <ol className="mt-2 list-decimal pl-5 text-sm">
          {GOLDEN.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ol>
      </article>
      {selected ? (
        <Wizard title={selected.title} start={selected.start} nodes={selected.nodes} />
      ) : (
        <CaseList />
      )}
      <SafetyBanner />
    </div>
  )
}

function CaseList() {
  return (
    <div className="grid gap-3">
      {CASES.map((item) => (
        <Link
          key={item.id}
          to={`/diagnostico/${item.id}`}
          className="min-h-16 rounded-2xl border border-line bg-surface p-4 sun:border-2"
        >
          <span className="font-semibold">{item.title}</span>
        </Link>
      ))}
    </div>
  )
}

function Wizard({
  title,
  start,
  nodes,
}: {
  title: string
  start: string
  nodes: readonly WizardNode[]
}) {
  const byId = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes])
  const [stack, setStack] = useState<string[]>([start])
  const currentId = stack[stack.length - 1] ?? start
  const node = byId.get(currentId)
  if (!node) return <p>Ese paso no está en el árbol.</p>
  return (
    <section className="rounded-2xl border border-line bg-surface p-4 sun:border-2">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-sm text-muted">Paso {stack.length}</span>
      </div>
      {node.kind === 'question' ? (
        <>
          <p className="mt-3 text-lg">{node.question}</p>
          {node.help ? <p className="mt-2 text-sm text-muted">{node.help}</p> : null}
          {node.safety ? (
            <p className="mt-2 text-sm text-amber-200 sun:text-amber-900">{node.safety}</p>
          ) : null}
          <div className="mt-4 flex flex-col gap-2">
            {node.options.map((option) => (
              <button
                key={option.label}
                type="button"
                className="min-h-12 rounded-xl border border-line px-3 text-left sun:border-2"
                onClick={() => setStack((current) => [...current, option.next])}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 text-lg">{node.result}</p>
          <ul className="mt-3 flex list-disc flex-col gap-1 pl-5 text-sm">
            {node.actions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
          {node.measurements?.map((item) => (
            <p key={item} className="mt-2 text-sm text-muted">
              {item}
            </p>
          ))}
          {node.links?.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="mt-3 inline-flex min-h-12 items-center text-copper"
            >
              {link.label}
            </Link>
          ))}
        </>
      )}
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="min-h-12 rounded-xl border border-line px-4"
          disabled={stack.length < 2}
          onClick={() => setStack((current) => current.slice(0, -1))}
        >
          Atrás
        </button>
        <button
          type="button"
          className="min-h-12 rounded-xl px-4 text-muted"
          onClick={() => setStack([start])}
        >
          Reiniciar
        </button>
        <Link to="/diagnostico" className="inline-flex min-h-12 items-center px-2 text-muted">
          Otros casos
        </Link>
      </div>
    </section>
  )
}
