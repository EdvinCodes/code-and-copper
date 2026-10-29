export const CONDUCTOR_COLORS = [
  {
    id: 'l1',
    name: 'Fase L1',
    color: '#8B4513',
    ink: '#fff',
    rule: 'Convención UNE-HD 308 / IEC 60445. El REBT solo exige marrón o negro para las fases.',
  },
  {
    id: 'l2',
    name: 'Fase L2',
    color: '#111111',
    ink: '#fff',
    rule: 'Negro. No es la primera fase.',
  },
  {
    id: 'l3',
    name: 'Fase L3',
    color: '#808080',
    ink: '#111',
    rule: 'Gris, cuando hay que distinguir la tercera fase.',
  },
  {
    id: 'n',
    name: 'Neutro',
    color: '#4FA3E0',
    ink: '#082033',
    rule: 'Azul claro. Obligatorio si existe neutro o se prevé que una fase pase a neutro.',
  },
  {
    id: 'pe',
    name: 'Protección',
    color: 'stripes',
    ink: '#111',
    rule: 'Verde-amarillo. No se usa para otra función.',
  },
] as const

export const KNX_COLORS = [
  { name: 'Bus +', color: '#D32F2F', role: 'Rojo. Positivo del par de datos y 30 V SELV.' },
  { name: 'Bus −', color: '#111111', role: 'Negro. Negativo del mismo par.' },
  { name: 'Reserva', color: '#F5F5F5', role: 'Blanco. Par auxiliar, no es un segundo bus.' },
  {
    name: 'Reserva',
    color: '#FBC02D',
    role: 'Amarillo. Se puede dejar sin conectar o usar para otra SELV.',
  },
  {
    name: 'Cubierta',
    color: '#57A639',
    role: 'Verde RAL 6018. Cable certificado YCYM o J-Y(St)Y 2x2x0,8.',
  },
] as const
