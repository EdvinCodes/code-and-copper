import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { SafetyBanner } from '../../components/SafetyBanner.tsx'
import { DATA_VERIFIED_AT } from '../../data/meta.ts'
import { useHistory } from '../../stores/history.ts'

const path = [
  {
    n: '1',
    to: '/calc/ohm',
    title: 'Qué son los voltios, los amperios y los vatios',
    text: 'Con dos números salen los otros dos. Es la base de todo lo demás.',
  },
  {
    n: '2',
    to: '/calc/seccion',
    title: 'Qué cable y qué automático poner',
    text: 'Eliges si son las luces, los enchufes o la cocina, y te dice el grosor y la protección.',
  },
  {
    n: '3',
    to: '/cuadro',
    title: 'Qué hay en el cuadro de casa',
    text: 'Cada aparato del carril, para qué sirve y cómo se cablea.',
  },
]

const tools = [
  {
    to: '/chuletas',
    title: 'Tablas',
    text: 'Colores de los cables, circuitos de una vivienda y gases.',
  },
  {
    to: '/diagnostico',
    title: 'Si algo falla',
    text: 'Preguntas cortas para un diferencial, un automático o un split.',
  },
  {
    to: '/calc/clima',
    title: 'Aire y frío',
    text: 'Qué equipo cabe en una habitación y si el split está rindiendo.',
  },
  {
    to: '/arsenal',
    title: 'Qué comprar',
    text: 'La lista del banco de casa, el maletín y el equipo de frío.',
  },
]

export function HomePage() {
  const entries = useHistory((state) => state.entries).slice(0, 5)
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="panel panel-lesson p-5">
        <p className="text-sm font-semibold tracking-wide text-copper uppercase">
          Para aprender y para la obra
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Empieza por lo que no conoces
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Cada pantalla dice primero para qué sirve y qué significa cada dato. Los números siguen la
          norma española, contrastados el {DATA_VERIFIED_AT}. Funciona sin cobertura.
        </p>
      </header>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Un orden para estudiar</h2>
        {path.map((item) => (
          <Link key={item.to} to={item.to} className="panel flex min-h-24 items-center gap-4 p-4">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-copper-deep font-semibold text-white">
              {item.n}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{item.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted">{item.text}</span>
            </span>
            <ArrowRight aria-hidden="true" className="size-5 shrink-0 text-copper" />
          </Link>
        ))}
      </section>
      <section>
        <h2 className="text-lg font-semibold">Cuando ya tengas el mapa</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {tools.map((item) => (
            <Link key={item.to} to={item.to} className="panel min-h-24 p-4">
              <span className="block font-semibold">{item.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted">{item.text}</span>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Lo último que calculaste</h2>
        {entries.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Todavía no hay nada guardado en este móvil.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {entries.map((entry) => (
              <li key={entry.id}>
                <Link to={entry.href} className="panel block px-4 py-3">
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
