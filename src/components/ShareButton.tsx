import { useState } from 'react'

export function ShareButton({ title }: { title: string }) {
  const [note, setNote] = useState('')

  async function share() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
        setNote('Compartido.')
        return
      }
      await navigator.clipboard.writeText(url)
      setNote('Enlace copiado.')
    } catch {
      setNote('No se pudo compartir.')
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        className="min-h-12 rounded-xl border border-line px-4 sun:border-2"
        onClick={() => void share()}
      >
        Compartir enlace
      </button>
      {note ? <span className="text-sm text-muted">{note}</span> : null}
    </div>
  )
}
