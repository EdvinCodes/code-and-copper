import { useState } from 'react'
import { DATA_VERIFIED_AT } from '../../data/meta.ts'
import { applyBackup, buildBackup } from '../../stores/backup.ts'
import { useHistory } from '../../stores/history.ts'
import { useSettings } from '../../stores/settings.ts'

export function SettingsPage() {
  const theme = useSettings((state) => state.theme)
  const setTheme = useSettings((state) => state.setTheme)
  const wakeLock = useSettings((state) => state.wakeLock)
  const setWakeLock = useSettings((state) => state.setWakeLock)
  const clear = useHistory((state) => state.clear)
  const [message, setMessage] = useState('')

  function download() {
    const blob = new Blob([JSON.stringify(buildBackup(), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'code-and-copper.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  async function restore(file: File | undefined) {
    if (!file) return
    try {
      const error = applyBackup(JSON.parse(await file.text()))
      setMessage(error ?? 'Copia restaurada en este dispositivo.')
    } catch {
      setMessage('Ese archivo no es JSON.')
    }
  }

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
        aria-pressed={wakeLock}
        className="min-h-12 rounded-xl border border-line px-4 text-left sun:border-2"
        onClick={() => setWakeLock(!wakeLock)}
      >
        {wakeLock
          ? 'La pantalla se mantiene encendida'
          : 'Mantener la pantalla encendida en diagnóstico'}
      </button>
      <button
        type="button"
        className="min-h-12 rounded-xl border border-line px-4 text-left sun:border-2"
        onClick={download}
      >
        Exportar copia JSON
      </button>
      <label className="flex min-h-12 cursor-pointer items-center rounded-xl border border-line px-4 sun:border-2">
        Importar copia JSON
        <input
          type="file"
          accept="application/json"
          className="sr-only"
          onChange={(event) => void restore(event.target.files?.[0])}
        />
      </label>
      {message ? <p className="text-sm">{message}</p> : null}
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
