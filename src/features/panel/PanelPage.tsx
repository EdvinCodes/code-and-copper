import { useState } from 'react'
import { Sheet } from '../../components/Sheet.tsx'
import { PANEL_MODULES, type PanelModule, SCHEMATICS } from '../../data/panel.ts'

export function PanelPage() {
  const [open, setOpen] = useState<PanelModule | null>(null)
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Cuadro</h1>
        <p className="mt-2 text-muted">
          Pulsa un aparato del carril. La ficha dice qué es, cómo se cablea y a qué se parece en
          software.
        </p>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-line bg-zinc-900 p-4 sun:border-2 sun:bg-zinc-100">
        <div className="flex h-44 min-w-max items-end gap-1 border-b-8 border-zinc-500 px-2">
          {PANEL_MODULES.map((module) => (
            <button
              key={module.id}
              type="button"
              className="flex h-28 items-center justify-center rounded-t-md px-1 text-xs font-semibold text-white"
              style={{ width: `${module.width * 4.5}rem`, background: module.tone }}
              onClick={() => setOpen(module)}
            >
              {module.short}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-zinc-400">
          Carril DIN. El ancho es orientativo, a razón de 18 mm por módulo.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {SCHEMATICS.map((scheme) => (
          <article
            key={scheme.id}
            className="rounded-2xl border border-line bg-surface p-4 sun:border-2"
          >
            <h2 className="text-lg font-semibold">{scheme.title}</h2>
            <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm">
              {scheme.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>
        ))}
      </div>
      <Sheet open={open !== null} title={open?.name ?? ''} onClose={() => setOpen(null)}>
        {open ? (
          <div className="flex flex-col gap-3 text-sm">
            <p>{open.what}</p>
            <Field label="Ficha" text={open.spec} />
            <Field label="Cableado" text={open.wiring} />
            <Field label="Errores típicos" text={open.mistakes} />
            <Field label="En software" text={open.software} />
          </div>
        ) : null}
      </Sheet>
    </div>
  )
}

function Field({ label, text }: { label: string; text: string }) {
  return (
    <p>
      <span className="font-semibold text-copper">{label}. </span>
      {text}
    </p>
  )
}
