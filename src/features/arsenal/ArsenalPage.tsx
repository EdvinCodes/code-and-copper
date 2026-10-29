import { useState } from 'react'
import { Tabs } from '../../components/Tabs.tsx'
import { ARSENAL, ARSENAL_TABS, type Priority } from '../../data/arsenal.ts'
import { useArsenal } from '../../stores/arsenal.ts'

const priorityLabel: Record<Priority, string> = {
  imprescindible: 'Imprescindible',
  recomendado: 'Recomendado',
  opcional: 'Opcional',
}

export function ArsenalPage() {
  const [tab, setTab] = useState<(typeof ARSENAL_TABS)[number]['id']>('banco')
  const checked = useArsenal((state) => state.checked)
  const notes = useArsenal((state) => state.notes)
  const toggle = useArsenal((state) => state.toggle)
  const setNote = useArsenal((state) => state.setNote)
  const items = ARSENAL.filter((item) => item.tab === tab)
  const done = items.filter((item) => checked[item.id]).length

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Arsenal</h1>
        <p className="mt-2 text-muted">
          {done} de {items.length} en esta pestaña. El progreso se queda en este dispositivo.
        </p>
      </header>
      <Tabs
        value={tab}
        onChange={setTab}
        options={ARSENAL_TABS.map((item) => ({ value: item.id, label: item.label }))}
      />
      {tab === 'banco' ? (
        <p className="text-sm text-muted">
          Cablea el banco sin tensión y aliméntalo desde una toma que ya tenga diferencial de 30 mA.
        </p>
      ) : null}
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-2xl border border-line bg-surface p-4 sun:border-2">
            <label className="flex min-h-12 items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 size-5"
                checked={checked[item.id] === true}
                onChange={() => toggle(item.id)}
              />
              <span>
                <span className="font-semibold">{item.name}</span>
                <span className="mt-1 block text-sm text-copper">
                  {priorityLabel[item.priority]}
                </span>
                <span className="mt-1 block text-sm">{item.why}</span>
                <span className="mt-1 block text-sm text-muted">{item.spec}</span>
              </span>
            </label>
            <input
              value={notes[item.id] ?? ''}
              onChange={(event) => setNote(item.id, event.target.value)}
              placeholder="Nota: modelo, precio, pendiente…"
              className="mt-3 min-h-12 w-full rounded-xl border border-line bg-bg px-3 sun:border-2"
              aria-label={`Nota de ${item.name}`}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
