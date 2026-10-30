import { useRegisterSW } from 'virtual:pwa-register/react'
import { useState } from 'react'

export function PwaUpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()
  const [busy, setBusy] = useState(false)

  if (!needRefresh) return null

  async function applyUpdate() {
    setBusy(true)
    try {
      const registrations =
        'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistrations() : []
      const waiting = registrations.flatMap((registration) =>
        registration.waiting ? [registration.waiting] : [],
      )
      if (waiting.length > 0) {
        await new Promise<void>((resolve) => {
          const finish = () => resolve()
          navigator.serviceWorker.addEventListener('controllerchange', finish, { once: true })
          window.setTimeout(finish, 2500)
          for (const worker of waiting) worker.postMessage({ type: 'SKIP_WAITING' })
        })
      } else {
        await updateServiceWorker(true)
      }
    } catch {
      /* si el service worker no responde, recargamos igual */
    }
    window.location.reload()
  }

  return (
    <div className="fixed right-4 bottom-24 z-50 flex w-[min(24rem,calc(100%-2rem))] items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-3 shadow-lg md:bottom-6">
      <p className="text-sm">Hay una versión nueva de Code & Copper.</p>
      <div className="flex gap-2">
        <button
          type="button"
          className="min-h-12 rounded-xl px-3 text-sm text-muted"
          disabled={busy}
          onClick={() => setNeedRefresh(false)}
        >
          Luego
        </button>
        <button
          type="button"
          className="min-h-12 rounded-xl bg-copper-deep px-4 text-sm font-semibold text-white disabled:opacity-70"
          disabled={busy}
          onClick={() => void applyUpdate()}
        >
          {busy ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>
    </div>
  )
}
