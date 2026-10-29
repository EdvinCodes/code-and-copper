export function NumberField({
  label,
  value,
  onChange,
  unit,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  unit?: string
  hint?: string
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/gi, '-')
  return (
    <label htmlFor={id} className="flex flex-col gap-1">
      <span className="text-sm font-medium">{label}</span>
      <span className="flex items-center gap-2">
        <input
          id={id}
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-12 w-full rounded-xl border border-line bg-surface px-3 text-lg sun:border-2"
        />
        {unit ? <span className="w-12 shrink-0 text-sm text-muted">{unit}</span> : null}
      </span>
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  )
}
