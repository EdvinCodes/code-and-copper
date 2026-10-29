import { describe, expect, it } from 'vitest'
import { applyBackup, buildBackup } from './backup.ts'

describe('copia de seguridad', () => {
  it('acepta un archivo exportado y rechaza otro', () => {
    const file = buildBackup()
    expect(applyBackup(file)).toBeNull()
    expect(applyBackup({ version: 2 })).toBeTruthy()
  })
})
