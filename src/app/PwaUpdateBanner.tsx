import { useRegisterSW } from 'virtual:pwa-register/react'

export function PwaUpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed inset-x-4 bottom-24 z-40 flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-3 shadow-lg md:bottom-6 md:left-auto md:max-w-md">
      <p className="text-sm">Hay una versión nueva de Code & Copper.</p>
      <div className="flex gap-2">
        <button
          type="button"
          className="min-h-12 rounded-xl px-3 text-sm text-muted"
          onClick={() => setNeedRefresh(false)}
        >
          Luego
        </button>
        <button
          type="button"
          className="min-h-12 rounded-xl bg-copper-deep px-4 text-sm font-semibold text-white"
          onClick={() => void updateServiceWorker(true)}
        >
          Actualizar
        </button>
      </div>
    </div>
  )
}
