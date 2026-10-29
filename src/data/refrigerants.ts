/** Saturación en bar relativos. CoolProp 8, patm 1,01325 bar. R32 coincide con Daikin Chemical y R410A con Chemours. */

export const ATM_BAR = 1.01325
export const BAR_TO_PSI = 14.503773773

export const PT_TEMPS = [
  -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60,
] as const

export const REFRIGERANTS = {
  R32: {
    name: 'R32',
    gwp: 675,
    safety: 'A2L',
    glide: 0,
    kind: 'HFC puro',
    note: 'Split aire-aire de hasta 12 kW: se puede comercializar hasta el 31/12/2028. Split aire-agua y monobloque de hasta 12 kW con PCA ≥ 150: prohibidos desde el 01/01/2027.',
    p: [
      1.72, 2.33, 3.04, 3.87, 4.81, 5.89, 7.12, 8.5, 10.06, 11.79, 13.73, 15.88, 18.26, 20.89,
      23.77, 26.93, 30.4, 34.19, 38.32,
    ],
  },
  R410A: {
    name: 'R410A',
    gwp: 2088,
    safety: 'A1',
    glide: 0.1,
    kind: 'Mezcla casi azeotrópica',
    note: 'Prohibido en split simple nuevo de menos de 3 kg desde el 01/01/2025. Solo mantenimiento. Cargar en fase líquida.',
    p: [
      1.69, 2.29, 2.99, 3.8, 4.73, 5.79, 6.99, 8.35, 9.87, 11.57, 13.46, 15.56, 17.88, 20.44, 23.24,
      26.32, 29.69, 33.38, 37.41,
    ],
  },
  R290: {
    name: 'R290',
    gwp: 3,
    safety: 'A3',
    glide: 0,
    kind: 'Propano, no fluorado',
    note: 'Fuera del reglamento F-gas, pero le aplican el RSIF y la UNE-EN 378. Típico en monobloque de exterior. Herramienta antichispa y detector de hidrocarburos.',
    p: [
      0.67, 1.02, 1.43, 1.9, 2.44, 3.05, 3.73, 4.5, 5.35, 6.3, 7.35, 8.51, 9.78, 11.17, 12.68,
      14.33, 16.12, 18.06, 20.15,
    ],
  },
  R454B: {
    name: 'R454B',
    gwp: 465,
    safety: 'A2L',
    glide: 1.5,
    kind: 'Mezcla zeotrópica R32/R1234yf',
    note: 'Recalentamiento con la columna de rocío y subenfriamiento con la de burbuja. Cargar en líquido. Mismas fechas que el R32 en equipos de hasta 12 kW, porque su PCA sigue siendo ≥ 150.',
    bubble: [
      1.59, 2.16, 2.83, 3.61, 4.5, 5.51, 6.66, 7.96, 9.41, 11.03, 12.83, 14.83, 17.04, 19.46, 22.12,
      25.04, 28.21, 31.68, 35.44,
    ],
    dew: [
      1.45, 2.0, 2.64, 3.38, 4.24, 5.21, 6.31, 7.56, 8.96, 10.52, 12.27, 14.2, 16.35, 18.71, 21.31,
      24.17, 27.3, 30.73, 34.49,
    ],
  },
} as const

export type GasId = keyof typeof REFRIGERANTS

export const FGAS_CALENDAR = [
  {
    date: '01/01/2025',
    text: 'Split simple de menos de 3 kg con PCA ≥ 750. El R410A nuevo sale de ese mercado.',
  },
  {
    date: '01/01/2027',
    text: 'Split aire-agua ≤ 12 kW con PCA ≥ 150, y monobloque ≤ 12 kW o de 12 a 50 kW con PCA ≥ 150.',
  },
  {
    date: '01/01/2029',
    text: 'Split aire-aire ≤ 12 kW con PCA ≥ 150, y split de más de 12 kW con PCA ≥ 750.',
  },
  { date: '01/01/2030', text: 'Otros equipos autónomos con PCA ≥ 150.' },
  { date: '01/01/2032', text: 'Monobloque ≤ 12 kW con cualquier gas fluorado.' },
  { date: '01/01/2033', text: 'Split de más de 12 kW con PCA ≥ 150.' },
  { date: '01/01/2035', text: 'Split ≤ 12 kW con cualquier gas fluorado.' },
] as const

export const PIPES = [
  { inch: '1/4"', mm: 6.35, nut: 17 },
  { inch: '3/8"', mm: 9.52, nut: 22 },
  { inch: '1/2"', mm: 12.7, nut: 26 },
  { inch: '5/8"', mm: 15.88, nut: 29 },
  { inch: '3/4"', mm: 19.05, nut: 32 },
] as const

/** Pares en N·m. La última columna es la franja común, no un valor universal. Manda el manual del equipo. */
export const FLARE_TORQUE = [
  {
    inch: '1/4"',
    daikin: '14,2–17,2',
    msz: '13,7–17,7',
    puz: '14–18',
    fujitsu: '16–18',
    toshiba: '14–18',
    common: '16–17,2',
  },
  {
    inch: '3/8"',
    daikin: '32,7–39,9',
    msz: '34,3–41,2',
    puz: '34–42',
    fujitsu: '32–42',
    toshiba: '30–42',
    common: '34,3–39,9',
  },
  {
    inch: '1/2"',
    daikin: '49,5–60,3',
    msz: '49,0–56,4',
    puz: '49–61',
    fujitsu: '49–61',
    toshiba: '50–62',
    common: '50–56,4',
  },
  {
    inch: '5/8"',
    daikin: '61,8–75,4',
    msz: '73,5–78,4',
    puz: '68–82',
    fujitsu: '63–75',
    toshiba: '—',
    common: '73,5–75',
  },
  { inch: '3/4"', daikin: '—', msz: '—', puz: '100–120', fujitsu: '—', toshiba: '—', common: '—' },
] as const

export const VACUUM_STEPS = [
  'Soldar con barrido de nitrógeno. Nunca con aire ni con oxígeno.',
  'Prueba de estanqueidad con nitrógeno seco a la presión del fabricante (en R32 Daikin, máximo 4,17 MPa) durante al menos 1 hora, mejor 24, sin caída.',
  'Vaciar, montar bomba de doble etapa apta para A2L (antichispa si es R290) y vacuómetro con mangueras cortas.',
  'Vacío por debajo de 500 micras durante al menos 1 hora.',
  'Aislar 10 minutos. Si pasa de 1500 micras y se estabiliza, hay humedad. Si no para de subir, hay fuga.',
  'Abrir válvulas y buscar fugas con detector de al menos 5 g/año, o con agua jabonosa.',
  'La carga adicional, según la placa y el registro. Aceite solo en el cono interior del abocardado, nunca en la rosca.',
] as const

export const EQUIPMENT_KW = [2, 2.5, 3.5, 4.2, 5, 6, 7.1] as const
