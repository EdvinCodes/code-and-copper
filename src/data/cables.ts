export const CABLE_TYPES = [
  {
    id: 'h07v',
    name: 'H07V-U / H07V-R / H07V-K',
    temp: '70 °C',
    family: 'PVC' as const,
    text: '450/750 V. El sufijo -U es rígido de un hilo, -R rígido de varios y -K flexible de clase 5. Es el cable de interior bajo tubo. No es libre de halógenos.',
  },
  {
    id: 'h07z1',
    name: 'H07Z1-K (AS) y ES07Z1-K',
    temp: '70 °C',
    family: 'PVC' as const,
    text: 'Poliolefina termoplástica, libre de halógenos y no propagador del incendio. Va en la columna de 70 °C, no en la de XLPE. Exigido en derivaciones individuales y en pública concurrencia.',
  },
  {
    id: 'rvk',
    name: 'RV-K 0,6/1 kV',
    temp: '90 °C',
    family: 'XLPE' as const,
    text: 'Aislamiento de XLPE y cubierta de PVC. Exterior, enterrado bajo tubo y bandeja. No es libre de halógenos.',
  },
  {
    id: 'rz1',
    name: 'RZ1-K (AS) 0,6/1 kV',
    temp: '90 °C',
    family: 'XLPE' as const,
    text: 'XLPE libre de halógenos. Línea general de alimentación, derivación individual y pública concurrencia.',
  },
  {
    id: 'al',
    name: 'AL RZ1 / AL XZ1',
    temp: '90 °C',
    family: 'XLPE' as const,
    text: 'Aluminio, desde 10 mm² en estas tablas. En viviendas y garajes colectivos de viviendas la recarga de vehículo no admite aluminio. Las conexiones de aluminio necesitan técnica específica: el par galvánico con el cobre lo estropea.',
  },
] as const

export const PE_RULES = [
  'Hasta 16 mm², la tierra tiene la misma sección que la fase.',
  'Entre 16 y 35 mm², la tierra es de 16 mm².',
  'Por encima de 35 mm², la mitad, subiendo a la sección comercial siguiente.',
  'Si la tierra no va en la misma canalización: mínimo 2,5 mm² con protección mecánica, o 4 mm² sin ella.',
] as const
