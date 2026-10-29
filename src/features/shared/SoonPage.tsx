import { SafetyBanner } from '../../components/SafetyBanner.tsx'

export function SoonPage({ title, text }: { title: string; text: string }) {
  return (
    <article className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-muted">{text}</p>
      <SafetyBanner />
    </article>
  )
}

export function CheatsSoon() {
  return <SoonPage title="Chuletas" text="Tablas de consulta rápida." />
}

export function PanelSoon() {
  return <SoonPage title="Cuadro" text="Anatomía del carril DIN." />
}

export function DiagnosticSoon() {
  return <SoonPage title="Diagnóstico" text="Árboles de avería." />
}

export function ArsenalSoon() {
  return <SoonPage title="Arsenal" text="Banco, maletín y equipo de clima." />
}

export function MissingSoon() {
  return <SoonPage title="No está aquí" text="Esa ruta no existe en Code & Copper." />
}
