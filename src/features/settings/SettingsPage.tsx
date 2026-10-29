import { DATA_VERIFIED_AT } from '../../data/meta.ts'
import { useHistory } from '../../stores/history.ts'
import { useSettings } from '../../stores/settings.ts'

export function SettingsPage() {
  const theme = useSettings((state) => state.theme)
  const setTheme = useSettings((state) => state.setTheme)
  const clear = useHistory((state) => state.clear)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Ajustes</h1>
        <p className="mt-2 text-muted">
          Todo se queda en este dispositivo. Los datos normativos se contrastaron el{' '}
          {DATA_VERIFIED_AT}.
        </p>
      </header>
      <fieldset className="rounded-2xl border border-line bg-surface p-4 sun:border-2">
        <legend className="px-1 font-semibold">Tema</legend>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            aria-pressed={theme === 'dark'}
            className={`min-h-12 rounded-xl border border-line ${theme === 'dark' ? 'bg-copper-deep text-white' : ''}`}
            onClick={() => setTheme('dark')}
          >
            Obra oscura
          </button>
          <button
            type="button"
            aria-pressed={theme === 'sun'}
            className={`min-h-12 rounded-xl border border-line ${theme === 'sun' ? 'bg-copper-deep text-white' : ''}`}
            onClick={() => setTheme('sun')}
          >
            Modo Sol
          </button>
        </div>
      </fieldset>
      <button
        type="button"
        className="min-h-12 rounded-xl border border-line px-4 text-left"
        onClick={clear}
      >
        Borrar historial de cálculos
      </button>
    </div>
  )
}
