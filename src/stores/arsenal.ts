import { z } from 'zod'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const persistedSchema = z.object({
  checked: z.record(z.string(), z.boolean()),
  notes: z.record(z.string(), z.string()),
})

type ArsenalState = {
  checked: Record<string, boolean>
  notes: Record<string, string>
  toggle: (id: string) => void
  setNote: (id: string, note: string) => void
  replace: (checked: Record<string, boolean>, notes: Record<string, string>) => void
}

export const useArsenal = create<ArsenalState>()(
  persist(
    (set) => ({
      checked: {},
      notes: {},
      toggle: (id) =>
        set((state) => ({
          checked: { ...state.checked, [id]: !state.checked[id] },
        })),
      setNote: (id, note) => set((state) => ({ notes: { ...state.notes, [id]: note } })),
      replace: (checked, notes) => set({ checked, notes }),
    }),
    {
      name: 'cc-arsenal',
      version: 1,
      partialize: (state) => ({ checked: state.checked, notes: state.notes }),
      merge: (persisted, current) => {
        const parsed = persistedSchema.safeParse(persisted)
        if (!parsed.success) return current
        return { ...current, ...parsed.data }
      },
    },
  ),
)
