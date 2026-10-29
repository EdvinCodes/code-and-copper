import type { WizardNode } from '../../engine/wizard.ts'

export const BREAKER_START = 'b-inicio'

export const BREAKER: WizardNode[] = [
  {
    id: 'b-inicio',
    kind: 'question',
    question: '¿Qué salta, y cuándo?',
    options: [
      { label: 'El PIA, al momento', next: 'b-corto' },
      { label: 'El PIA, después de varios minutos', next: 'b-carga' },
      { label: 'El IGA', next: 'b-iga' },
      { label: 'El contador corta y el cuadro no', next: 'b-contrato' },
    ],
  },
  {
    id: 'b-corto',
    kind: 'question',
    question: 'Sin tensión y con el PIA abierto, mide ohmios entre fase y neutro del circuito.',
    safety:
      'Confirma ausencia de tensión con un detector bipolar antes de poner el polímetro en ohmios.',
    options: [
      { label: 'Casi cero aunque no haya receptores', next: 'b-cable' },
      { label: 'Abierto sin receptores y bajo con alguno conectado', next: 'b-receptor' },
      { label: 'Solo al encender muchos drivers LED', next: 'b-led' },
    ],
  },
  {
    id: 'b-cable',
    kind: 'result',
    result: 'Cortocircuito en el cableado o en un mecanismo.',
    actions: [
      'Abre cajas y mecanismos de ese circuito.',
      'El tramo con continuidad franca entre fase y neutro es el dañado. No subas el calibre.',
    ],
    measurements: ['Continuidad sin tensión. Cero ohmios, o muy pocos, es un contacto metálico.'],
  },
  {
    id: 'b-receptor',
    kind: 'result',
    result: 'El cortocircuito está en un receptor.',
    actions: [
      'Aísla el aparato. No lo vuelvas a enchufar en otro circuito para comprobarlo.',
      'Si es una regleta o un alargador, míralo antes que la instalación.',
    ],
  },
  {
    id: 'b-led',
    kind: 'result',
    result: 'El magnético ve el pico de arranque, no una sobrecarga.',
    actions: [
      'Reparte los drivers o usa curva C si la línea y el cable lo permiten.',
      'Un limitador de arranque también vale. No pases a un calibre mayor solo por esto.',
    ],
  },
  {
    id: 'b-carga',
    kind: 'question',
    question: 'Con pinza True RMS, la intensidad de uso frente al calibre es…',
    options: [
      { label: 'Mayor que el calibre', next: 'b-reparto' },
      { label: 'Menor que el calibre', next: 'b-borna' },
    ],
  },
  {
    id: 'b-reparto',
    kind: 'result',
    result: 'Sobrecarga real. El térmico hace su trabajo.',
    actions: [
      'Reparte cargas o abre un circuito nuevo, con su sección.',
      'No cambies el PIA por otro mayor si el cable no da la Iz.',
    ],
    links: [{ to: '/calc/seccion', label: 'Calcular la sección del circuito nuevo' }],
  },
  {
    id: 'b-borna',
    kind: 'result',
    result: 'El PIA se calienta por un mal contacto o está agotado.',
    actions: [
      'Corta tensión y reaprisa bornas con el par del fabricante.',
      'Mira decoloración en el peine y en el propio PIA. Un cuadro caliente no se arregla subiendo el calibre.',
    ],
    measurements: ['Tras rearmar, la intensidad de uso tiene que quedar por debajo del In.'],
  },
  {
    id: 'b-iga',
    kind: 'result',
    result: 'O la suma de la vivienda supera el general, o hay un cortocircuito sin selectividad.',
    actions: [
      'Si salta al conectar un circuito, aíslalo como en el disparo instantáneo del PIA.',
      'Si salta con la casa entera en marcha, la potencia simultánea no cabe en el IGA.',
    ],
  },
  {
    id: 'b-contrato',
    kind: 'result',
    result: 'Ha actuado el limitador del contador, no la instalación.',
    actions: [
      'La potencia contratada es el techo. Subir potencia o quitar cargas a la vez.',
      'Un Shelly o Home Assistant puede deslastrar el termo o el coche antes de que corte.',
    ],
  },
]
