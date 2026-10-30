import type { ReactNode } from 'react'

export function ExplainAsDev({ children }: { children: ReactNode }) {
  return (
    <details className="rounded-2xl border border-line bg-surface p-3 sun:border-2">
      <summary className="flex min-h-12 cursor-pointer items-center font-medium">
        Si vienes de programar
      </summary>
      <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div>
    </details>
  )
}
