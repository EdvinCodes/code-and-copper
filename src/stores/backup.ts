import { z } from 'zod'
import { useArsenal } from './arsenal.ts'
import { useHistory } from './history.ts'
import { useSettings } from './settings.ts'

const backupSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  settings: z.object({
    theme: z.enum(['dark', 'sun']),
    wakeLock: z.boolean(),
  }),
  history: z.array(
    z.object({
      id: z.string(),
      at: z.number(),
      kind: z.enum(['cable', 'ohm', 'clima']),
      title: z.string(),
      summary: z.string(),
      href: z.string(),
    }),
  ),
  arsenal: z.object({
    checked: z.record(z.string(), z.boolean()),
    notes: z.record(z.string(), z.string()),
  }),
})

export type BackupFile = z.infer<typeof backupSchema>

export function buildBackup(): BackupFile {
  const settings = useSettings.getState()
  const history = useHistory.getState()
  const arsenal = useArsenal.getState()
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: { theme: settings.theme, wakeLock: settings.wakeLock },
    history: history.entries,
    arsenal: { checked: arsenal.checked, notes: arsenal.notes },
  }
}

export function applyBackup(raw: unknown): string | null {
  const parsed = backupSchema.safeParse(raw)
  if (!parsed.success) return 'El archivo no es una copia de Code & Copper.'
  useSettings.getState().setTheme(parsed.data.settings.theme)
  useSettings.getState().setWakeLock(parsed.data.settings.wakeLock)
  useHistory.setState({ entries: parsed.data.history })
  useArsenal.getState().replace(parsed.data.arsenal.checked, parsed.data.arsenal.notes)
  return null
}
