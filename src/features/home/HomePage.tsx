import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { SafetyBanner } from '../../components/SafetyBanner.tsx'
import { DATA_VERIFIED_AT } from '../../data/meta.ts'
import { useHistory } from '../../stores/history.ts'

const shortcuts = [
  {
    to: '/calc/seccion',
    title: 'Sección, caída y PIA',
    text: 'REBT: calentamiento, caída de tensión y protección.',
  },
  {
    to: '/calc/ohm',
    title: 'Ohm y potencia',
    text: 'Dos datos y salen los otros dos. Mono y trifásica.',
  },
  {
    to: '/calc/clima',
    title: 'Clima y frigorista',
    text: 'Carga, salto térmico, presiones y aerotermia.',
  },
  { to: '/chuletas', title: 'Chuletas', text: 'ITC-BT-25, colores, cables y gases.' },
  { to: '/cuadro', title: 'Cuadro', text: 'Carril DIN, diferenciales y mando de potencia.' },
  { to: '/diagnostico', title: 'Diagnóstico', text: 'Diferencial, magnetotérmico y split.' },
]

export function HomePage() {
  const entries = useHistory((state) => state.entries).slice(0, 5)
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header>
        <p className="text-sm font-medium tracking-wide text-copper uppercase">Campo y estudio</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">El copiloto del integrador</h1>
        <p className="mt-2 text-muted">
          Cálculos reales a 230/400 V, tablas del REBT y diagnóstico rápido. Funciona sin cobertura.
          Datos contrastados el {DATA_VERIFIED_AT}.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {shortcuts.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex min-h-24 items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 sun:border-2"
          >
            <span>
              <span className="block font-semibold">{item.title}</span>
              <span className="mt-1 block text-sm text-muted">{item.text}</span>
            </span>
            <ArrowRight aria-hidden="true" className="size-5 shrink-0 text-copper" />
          </Link>
        ))}
      </div>
      <section>
        <h2 className="text-lg font-semibold">Últimos cálculos</h2>
        {entries.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            Todavía no hay cálculos guardados en este dispositivo.
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {entries.map((entry) => (
              <li key={entry.id}>
                <Link
                  to={entry.href}
                  className="block rounded-2xl border border-line bg-surface px-4 py-3 sun:border-2"
                >
                  <span className="font-medium">{entry.title}</span>
                  <span className="mt-1 block text-sm text-muted">{entry.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <SafetyBanner />
    </div>
  )
}
