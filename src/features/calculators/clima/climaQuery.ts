import { z } from 'zod'
import type { GasId } from '../../../data/refrigerants.ts'
import type { ClimateZone, InsulationLevel, Orientation } from '../../../engine/thermalLoad.ts'

export type ClimaTab = 'carga' | 'salto' | 'ciclo' | 'caudal' | 'gases'
export type DeltaMode = 'split-frio' | 'split-calor' | 'aerotermia'

export type ClimaForm = {
  tab: ClimaTab
  area: string
  height: string
  insulation: InsulationLevel
  orientation: Orientation
  zone: ClimateZone
  people: string
  equipment: string
  roof: boolean
  windows: boolean
  deltaMode: DeltaMode
  inlet: string
  outlet: string
  design: string
  gas: GasId
  suctionP: string
  suctionT: string
  liquidP: string
  liquidT: string
  power: string
  waterDelta: string
  flow: string
  electric: string
}

export const defaultClimaForm: ClimaForm = {
  tab: 'carga',
  area: '20',
  height: '2,6',
  insulation: 'medio',
  orientation: 'S',
  zone: 'suave',
  people: '2',
  equipment: '0',
  roof: false,
  windows: false,
  deltaMode: 'split-frio',
  inlet: '24',
  outlet: '14',
  design: '5',
  gas: 'R32',
  suctionP: '8,5',
  suctionT: '12',
  liquidP: '26,32',
  liquidT: '40',
  power: '8',
  waterDelta: '5',
  flow: '20',
  electric: '2',
}

const schema = z.object({
  tab: z.enum(['carga', 'salto', 'ciclo', 'caudal', 'gases']).catch(defaultClimaForm.tab),
  area: z.string().catch(defaultClimaForm.area),
  height: z.string().catch(defaultClimaForm.height),
  insulation: z.enum(['bueno', 'medio', 'deficiente']).catch(defaultClimaForm.insulation),
  orientation: z.enum(['N', 'E', 'S', 'O']).catch(defaultClimaForm.orientation),
  zone: z.enum(['suave', 'calurosa']).catch(defaultClimaForm.zone),
  people: z.string().catch(defaultClimaForm.people),
  equipment: z.string().catch(defaultClimaForm.equipment),
  roof: z.enum(['0', '1']).catch('0'),
  windows: z.enum(['0', '1']).catch('0'),
  deltaMode: z.enum(['split-frio', 'split-calor', 'aerotermia']).catch(defaultClimaForm.deltaMode),
  inlet: z.string().catch(defaultClimaForm.inlet),
  outlet: z.string().catch(defaultClimaForm.outlet),
  design: z.string().catch(defaultClimaForm.design),
  gas: z.enum(['R32', 'R410A', 'R290', 'R454B']).catch(defaultClimaForm.gas),
  suctionP: z.string().catch(defaultClimaForm.suctionP),
  suctionT: z.string().catch(defaultClimaForm.suctionT),
  liquidP: z.string().catch(defaultClimaForm.liquidP),
  liquidT: z.string().catch(defaultClimaForm.liquidT),
  power: z.string().catch(defaultClimaForm.power),
  waterDelta: z.string().catch(defaultClimaForm.waterDelta),
  flow: z.string().catch(defaultClimaForm.flow),
  electric: z.string().catch(defaultClimaForm.electric),
})

export function formFromParams(params: URLSearchParams): ClimaForm {
  const parsed = schema.parse(Object.fromEntries(params.entries()))
  return {
    ...parsed,
    roof: parsed.roof === '1',
    windows: parsed.windows === '1',
  }
}

export function paramsFromForm(form: ClimaForm): URLSearchParams {
  return new URLSearchParams({
    tab: form.tab,
    area: form.area,
    height: form.height,
    insulation: form.insulation,
    orientation: form.orientation,
    zone: form.zone,
    people: form.people,
    equipment: form.equipment,
    roof: form.roof ? '1' : '0',
    windows: form.windows ? '1' : '0',
    deltaMode: form.deltaMode,
    inlet: form.inlet,
    outlet: form.outlet,
    design: form.design,
    gas: form.gas,
    suctionP: form.suctionP,
    suctionT: form.suctionT,
    liquidP: form.liquidP,
    liquidT: form.liquidT,
    power: form.power,
    waterDelta: form.waterDelta,
    flow: form.flow,
    electric: form.electric,
  })
}
