export function Formula({ children }: { children: string }) {
  return (
    <p className="rounded-xl bg-surface-2 p-3 font-mono text-sm leading-relaxed break-words">
      {children}
    </p>
  )
}
