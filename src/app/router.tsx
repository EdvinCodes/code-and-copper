import { createBrowserRouter } from 'react-router'
import { HomePage } from '../features/home/HomePage.tsx'
import { SettingsPage } from '../features/settings/SettingsPage.tsx'
import { MissingSoon } from '../features/shared/SoonPage.tsx'
import { AppShell } from './AppShell.tsx'
import { RootErrorBoundary } from './RootErrorBoundary.tsx'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: AppShell,
      ErrorBoundary: RootErrorBoundary,
      children: [
        { index: true, Component: HomePage },
        {
          path: 'calc/seccion',
          lazy: () =>
            import('../features/calculators/cable/CablePage.tsx').then((module) => ({
              Component: module.CablePage,
            })),
        },
        {
          path: 'calc/ohm',
          lazy: () =>
            import('../features/calculators/ohm/OhmPage.tsx').then((module) => ({
              Component: module.OhmPage,
            })),
        },
        {
          path: 'calc/clima',
          lazy: () =>
            import('../features/calculators/clima/ClimaPage.tsx').then((module) => ({
              Component: module.ClimaPage,
            })),
        },
        {
          path: 'chuletas',
          lazy: () =>
            import('../features/cheatsheets/CheatsPage.tsx').then((module) => ({
              Component: module.CheatsPage,
            })),
        },
        {
          path: 'cuadro',
          lazy: () =>
            import('../features/panel/PanelPage.tsx').then((module) => ({
              Component: module.PanelPage,
            })),
        },
        {
          path: 'diagnostico',
          lazy: () =>
            import('../features/diagnostics/DiagnosticPage.tsx').then((module) => ({
              Component: module.DiagnosticPage,
            })),
        },
        {
          path: 'diagnostico/:caso',
          lazy: () =>
            import('../features/diagnostics/DiagnosticPage.tsx').then((module) => ({
              Component: module.DiagnosticPage,
            })),
        },
        {
          path: 'arsenal',
          lazy: () =>
            import('../features/arsenal/ArsenalPage.tsx').then((module) => ({
              Component: module.ArsenalPage,
            })),
        },
        { path: 'ajustes', Component: SettingsPage },
        { path: '*', Component: MissingSoon },
      ],
    },
  ],
  { basename },
)
