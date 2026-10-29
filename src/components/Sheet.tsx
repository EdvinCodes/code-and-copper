import { type ReactNode, useEffect, useRef } from 'react'

export function Sheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={ref} className="sheet" onClose={onClose}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button type="button" className="min-h-12 rounded-xl px-3" onClick={onClose}>
          Cerrar
        </button>
      </div>
      <div className="max-h-[70dvh] overflow-y-auto px-4 py-4">{children}</div>
    </dialog>
  )
}
