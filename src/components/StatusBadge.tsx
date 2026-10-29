import { AlertTriangle, Check, type LucideIcon, OctagonX } from 'lucide-react'
import type { ReactNode } from 'react'

export type Status = 'ok' | 'warn' | 'danger'

const styles: Record<Status, string> = {
  ok: 'bg-emerald-950 text-emerald-200 sun:bg-emerald-100 sun:text-emerald-950',
  warn: 'bg-amber-950 text-amber-200 sun:bg-amber-100 sun:text-amber-950',
  danger: 'bg-red-950 text-red-200 sun:bg-red-100 sun:text-red-950',
}

const icons: Record<Status, LucideIcon> = {
  ok: Check,
  warn: AlertTriangle,
  danger: OctagonX,
}

export function StatusBadge({ status, children }: { status: Status; children: ReactNode }) {
  const Icon = icons[status]
  return (
    <span
      className={`inline-flex min-h-12 items-center gap-2 rounded-full px-4 text-sm font-semibold ${styles[status]}`}
    >
      <Icon aria-hidden="true" className="size-5 shrink-0" />
      {children}
    </span>
  )
}
