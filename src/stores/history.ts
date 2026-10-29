import { z } from 'zod'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const entrySchema = z.object({
  id: z.string(),
  at: z.number(),
  kind: z.enum(['cable', 'ohm', 'clima']),
  title: z.string(),
  summary: z.string(),
  href: z.string(),
})

export type HistoryEntry = z.infer<typeof entrySchema>

const persistedSchema = z.object({
  entries: z.array(entrySchema).max(50),
})

type HistoryState = {
  entries: HistoryEntry[]
  add: (entry: Omit<HistoryEntry, 'id' | 'at'>) => void
  clear: () => void
}

export const useHistory = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],
      add: (entry) =>
        set((state) => {
          const next: HistoryEntry = {
            ...entry,
            id: crypto.randomUUID(),
            at: Date.now(),
          }
          const rest = state.entries.filter((item) => item.href !== next.href)
          return { entries: [next, ...rest].slice(0, 50) }
        }),
      clear: () => set({ entries: [] }),
    }),
    {
      name: 'cc-history',
      version: 1,
      partialize: (state) => ({ entries: state.entries }),
      merge: (persisted, current) => {
        const parsed = persistedSchema.safeParse(persisted)
        if (!parsed.success) return current
        return { ...current, entries: parsed.data.entries }
      },
    },
  ),
)
