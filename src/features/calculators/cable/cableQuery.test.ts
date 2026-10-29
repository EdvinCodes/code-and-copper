import { describe, expect, it } from 'vitest'
import { defaultCableForm, formFromParams, paramsFromForm } from './cableQuery.ts'

describe('consulta de la calculadora de cable', () => {
  it('recupera los valores por defecto y conserva un enlace', () => {
    expect(formFromParams(new URLSearchParams()).power).toBe(defaultCableForm.power)
    const form = { ...defaultCableForm, length: '35', solar: true, preset: 'C2' as const }
    const again = formFromParams(paramsFromForm(form))
    expect(again.length).toBe('35')
    expect(again.solar).toBe(true)
    expect(again.preset).toBe('C2')
  })
})
