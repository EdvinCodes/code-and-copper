import { describe, expect, it } from 'vitest'
import { AC_START, AC_TREE } from '../data/diagnostics/ac.ts'
import { BREAKER, BREAKER_START } from '../data/diagnostics/breaker.ts'
import { DIFFERENTIAL, DIFFERENTIAL_START } from '../data/diagnostics/differential.ts'
import { validateWizard } from './wizard.ts'

describe('árboles de diagnóstico', () => {
  it('no tienen huérfanos, ciclos ni destinos rotos', () => {
    expect(validateWizard(DIFFERENTIAL, DIFFERENTIAL_START)).toEqual([])
    expect(validateWizard(BREAKER, BREAKER_START)).toEqual([])
    expect(validateWizard(AC_TREE, AC_START)).toEqual([])
  })
})
