import { describe, expect, it } from 'vitest'
import { defaultClimaForm, formFromParams, paramsFromForm } from './climaQuery.ts'

describe('consulta de clima', () => {
  it('recupera el enlace con la pestaña y los datos', () => {
    expect(formFromParams(new URLSearchParams()).area).toBe(defaultClimaForm.area)
    const form = { ...defaultClimaForm, tab: 'ciclo' as const, gas: 'R290' as const, roof: true }
    const again = formFromParams(paramsFromForm(form))
    expect(again.tab).toBe('ciclo')
    expect(again.gas).toBe('R290')
    expect(again.roof).toBe(true)
  })
})
