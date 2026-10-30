import { useState } from 'react'
import { PageIntro } from '../../components/Guide.tsx'
import { Sheet } from '../../components/Sheet.tsx'
import { PANEL_MODULES, type PanelModule, SCHEMATICS } from '../../data/panel.ts'

export function PanelPage() {
  const [open, setOpen] = useState<PanelModule | null>(null)
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <PageIntro kicker="La caja de la entrada" title="Qué hay en el cuadro y para qué">
        <p>
          El cuadro corta, protege y reparte. Pulsa cada aparato. La ficha dice qué hace, cómo se
          cablea y en qué se parece a una pieza de un programa, por si vienes de ahí.
        </p>
      </PageIntro>
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
          El dibujo es el carril. Si no reconoces la sigla, usa la lista de debajo.
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {PANEL_MODULES.map((module) => (
          <li key={module.id}>
            <button
              type="button"
              className="panel min-h-12 w-full px-4 py-3 text-left"
              onClick={() => setOpen(module)}
            >
              <span className="font-semibold text-copper">{module.short}</span>
              <span className="mt-1 block text-sm">{module.name}</span>
            </button>
          </li>
        ))}
      </ul>
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
