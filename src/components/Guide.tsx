import type { ReactNode } from 'react'

export function PageIntro({
  kicker,
  title,
  children,
}: {
  kicker: string
  title: string
  children: ReactNode
}) {
  return (
    <header className="panel panel-lesson p-5">
      <p className="text-sm font-semibold tracking-wide text-copper uppercase">{kicker}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-3 space-y-2 text-base leading-relaxed text-muted">{children}</div>
    </header>
  )
}

export function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="panel min-w-0 p-4">
      <h2 className="flex items-center gap-3 text-lg font-semibold">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-copper-deep text-sm text-white">
          {n}
        </span>
        {title}
      </h2>
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </section>
  )
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-muted">{children}</p>
}

export function UnitCards() {
  const units = [
    {
      symbol: 'V',
      name: 'Voltio',
      text: 'La presión con la que empuja la red. En un piso de España son 230 V. No es 110.',
    },
    {
      symbol: 'A',
      name: 'Amperio',
      text: 'Cuánta corriente pasa por el cable. El automático salta si te pasas de su número.',
    },
    {
      symbol: 'W',
      name: 'Vatio',
      text: 'La potencia. Está en la pegatina del aparato: un horno puede poner 2000 W.',
    },
  ]
  return (
    <dl className="grid gap-2 sm:grid-cols-3">
      {units.map((unit) => (
        <div key={unit.symbol} className="rounded-2xl bg-surface-2 p-3">
          <dt className="font-semibold">
            <span className="text-copper">{unit.symbol}</span> · {unit.name}
          </dt>
          <dd className="mt-1 text-sm leading-relaxed text-muted">{unit.text}</dd>
        </div>
      ))}
    </dl>
  )
}
