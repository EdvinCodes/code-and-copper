import {
  BookOpen,
  Calculator,
  LayoutGrid,
  type LucideIcon,
  Settings,
  Stethoscope,
  SunMedium,
  Wrench,
} from 'lucide-react'
import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { APP_NAME, APP_TAGLINE } from '../data/meta.ts'
import { applyTheme, useSettings } from '../stores/settings.ts'
import { PwaUpdateBanner } from './PwaUpdateBanner.tsx'

type Item = {
  to: string
  label: string
  icon: LucideIcon
  match: (path: string) => boolean
}

const items: Item[] = [
  {
    to: '/',
    label: 'Calcular',
    icon: Calculator,
    match: (path) => path === '/' || path.startsWith('/calc'),
  },
  {
    to: '/chuletas',
    label: 'Chuletas',
    icon: BookOpen,
    match: (path) => path.startsWith('/chuletas'),
  },
  { to: '/cuadro', label: 'Cuadro', icon: LayoutGrid, match: (path) => path.startsWith('/cuadro') },
  {
    to: '/diagnostico',
    label: 'Diagnóstico',
    icon: Stethoscope,
    match: (path) => path.startsWith('/diagnostico'),
  },
  { to: '/arsenal', label: 'Arsenal', icon: Wrench, match: (path) => path.startsWith('/arsenal') },
]

function NavList({ compact }: { compact: boolean }) {
  const { pathname } = useLocation()
  return (
    <ul className={compact ? 'grid grid-cols-5' : 'flex flex-col gap-1 p-3'}>
      {items.map((item) => {
        const active = item.match(pathname)
        const Icon = item.icon
        return (
          <li key={item.to}>
            <NavLink
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-2 text-xs font-medium ${
                compact ? 'flex-col py-1' : 'justify-start px-3 text-sm'
              } ${active ? 'bg-copper-deep text-white' : 'text-muted hover:bg-surface'}`}
            >
              <Icon aria-hidden="true" className="size-5" />
              <span className={compact ? 'max-w-full truncate' : ''}>{item.label}</span>
            </NavLink>
          </li>
        )
      })}
    </ul>
  )
}

export function AppShell() {
  const theme = useSettings((state) => state.theme)
  const toggleTheme = useSettings((state) => state.toggleTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-xl focus:bg-copper-deep focus:px-4 focus:py-3 focus:text-white"
      >
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-bg/95 px-4 backdrop-blur">
        <Link to="/" className="min-w-0">
          <span className="block truncate text-base font-semibold tracking-tight">{APP_NAME}</span>
          <span className="block truncate text-xs text-copper">{APP_TAGLINE}</span>
        </Link>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl"
            aria-pressed={theme === 'sun'}
            aria-label={theme === 'sun' ? 'Activar modo oscuro' : 'Activar Modo Sol'}
            onClick={toggleTheme}
          >
            <SunMedium aria-hidden="true" className="size-5" />
          </button>
          <Link
            to="/ajustes"
            aria-label="Ajustes"
            className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl"
          >
            <Settings aria-hidden="true" className="size-5" />
          </Link>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 border-r border-line md:block">
          <NavList compact={false} />
        </aside>
        <main id="contenido" className="min-w-0 flex-1 px-4 py-5 pb-28 md:pb-10">
          <Outlet />
        </main>
      </div>
      <nav
        aria-label="Módulos"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <NavList compact />
      </nav>
      <PwaUpdateBanner />
    </div>
  )
}
