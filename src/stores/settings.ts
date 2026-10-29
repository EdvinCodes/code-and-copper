import { z } from 'zod'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const settingsSchema = z.object({
  theme: z.enum(['dark', 'sun']),
  wakeLock: z.boolean(),
})

type SettingsState = {
  theme: 'dark' | 'sun'
  wakeLock: boolean
  setTheme: (theme: 'dark' | 'sun') => void
  toggleTheme: () => void
  setWakeLock: (enabled: boolean) => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      wakeLock: false,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'sun' ? 'dark' : 'sun' })),
      setWakeLock: (wakeLock) => set({ wakeLock }),
    }),
    {
      name: 'cc-settings',
      version: 1,
      partialize: (state) => ({ theme: state.theme, wakeLock: state.wakeLock }),
      merge: (persisted, current) => {
        const parsed = settingsSchema.safeParse(persisted)
        if (!parsed.success) return current
        return { ...current, ...parsed.data }
      },
    },
  ),
)

export function applyTheme(theme: 'dark' | 'sun'): void {
  if (theme === 'sun') document.documentElement.dataset.theme = 'sun'
  else delete document.documentElement.dataset.theme
  const color = theme === 'sun' ? '#ffffff' : '#020617'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color)
}
