export function Tabs<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={`min-h-12 shrink-0 rounded-xl border px-3 ${
              active
                ? 'border-copper bg-copper-deep text-white'
                : 'border-line bg-surface sun:border-2'
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
