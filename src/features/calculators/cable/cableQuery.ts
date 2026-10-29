import { z } from 'zod'
import { GROUPING, type GroupingKind, METHODS, type MethodId } from '../../../data/ampacity.ts'
import type { Insulation, SystemKind } from '../../../data/constants.ts'
import { type LineId, type Material, VOLTAGE_DROP_LIMITS } from '../../../data/constants.ts'
import { type CircuitId, HOUSING_CIRCUITS } from '../../../data/itcBt25.ts'
import type { LoadKind, ProtectionKind } from '../../../engine/cable.ts'

const presets = ['libre', ...HOUSING_CIRCUITS.map((item) => item.id)] as [
  'libre',
  CircuitId,
  ...CircuitId[],
]
const methods = Object.keys(METHODS) as [MethodId, ...MethodId[]]
const groupings = Object.keys(GROUPING) as [GroupingKind, ...GroupingKind[]]
const lines = VOLTAGE_DROP_LIMITS.map((item) => item.id) as [LineId, ...LineId[]]

export type CableForm = {
  mode: 'design' | 'verify'
  preset: 'libre' | CircuitId
  system: SystemKind
  entry: 'power' | 'current'
  powerUnit: 'W' | 'kW'
  power: string
  current: string
  cosPhi: string
  length: string
  material: Material
  insulation: Insulation
  method: MethodId
  ambient: string
  grouping: GroupingKind
  circuits: string
  solar: boolean
  protection: ProtectionKind
  lineId: LineId
  load: LoadKind
  section: string
}

export const defaultCableForm: CableForm = {
  mode: 'design',
  preset: 'libre',
  system: 'mono',
  entry: 'power',
  powerUnit: 'W',
  power: '3680',
  current: '16',
  cosPhi: '0,9',
  length: '20',
  material: 'Cu',
  insulation: 'PVC',
  method: 'B1',
  ambient: '40',
  grouping: 'bundled',
  circuits: '1',
  solar: false,
  protection: 'pia',
  lineId: 'fuerza',
  load: 'general',
  section: '2,5',
}

const schema = z.object({
  mode: z.enum(['design', 'verify']).catch(defaultCableForm.mode),
  preset: z.enum(presets).catch(defaultCableForm.preset),
  system: z.enum(['mono', 'tri']).catch(defaultCableForm.system),
  entry: z.enum(['power', 'current']).catch(defaultCableForm.entry),
  powerUnit: z.enum(['W', 'kW']).catch(defaultCableForm.powerUnit),
  power: z.string().catch(defaultCableForm.power),
  current: z.string().catch(defaultCableForm.current),
  cosPhi: z.string().catch(defaultCableForm.cosPhi),
  length: z.string().catch(defaultCableForm.length),
  material: z.enum(['Cu', 'Al']).catch(defaultCableForm.material),
  insulation: z.enum(['PVC', 'XLPE']).catch(defaultCableForm.insulation),
  method: z.enum(methods).catch(defaultCableForm.method),
  ambient: z.string().catch(defaultCableForm.ambient),
  grouping: z.enum(groupings).catch(defaultCableForm.grouping),
  circuits: z.string().catch(defaultCableForm.circuits),
  solar: z.enum(['0', '1']).catch('0'),
  protection: z.enum(['pia', 'gg']).catch(defaultCableForm.protection),
  lineId: z.enum(lines).catch(defaultCableForm.lineId),
  load: z.enum(['resistiva', 'general', 'motor', 'descarga', 've']).catch(defaultCableForm.load),
  section: z.string().catch(defaultCableForm.section),
})

export function formFromParams(params: URLSearchParams): CableForm {
  const parsed = schema.parse(Object.fromEntries(params.entries()))
  return { ...parsed, solar: parsed.solar === '1' }
}

export function paramsFromForm(form: CableForm): URLSearchParams {
  return new URLSearchParams({
    mode: form.mode,
    preset: form.preset,
    system: form.system,
    entry: form.entry,
    powerUnit: form.powerUnit,
    power: form.power,
    current: form.current,
    cosPhi: form.cosPhi,
    length: form.length,
    material: form.material,
    insulation: form.insulation,
    method: form.method,
    ambient: form.ambient,
    grouping: form.grouping,
    circuits: form.circuits,
    solar: form.solar ? '1' : '0',
    protection: form.protection,
    lineId: form.lineId,
    load: form.load,
    section: form.section,
  })
}
