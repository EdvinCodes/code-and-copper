import { ShieldAlert } from 'lucide-react'

export function SafetyBanner({ compact = false }: { compact?: boolean }) {
  return (
    <p
      className={`flex gap-3 rounded-2xl border border-amber-700/70 bg-amber-950/50 p-3 text-sm text-amber-100 sun:border-2 sun:border-amber-800 sun:bg-amber-50 sun:text-amber-950 ${compact ? '' : 'mt-4'}`}
    >
      <ShieldAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <span>
        Orientativo. No sustituye un proyecto o una memoria técnica de diseño, el manual del
        fabricante ni la verificación de un instalador habilitado.
      </span>
    </p>
  )
}
