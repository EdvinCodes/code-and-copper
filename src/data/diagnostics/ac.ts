import type { WizardNode } from '../../engine/wizard.ts'

export const AC_START = 'a-inicio'

export const AC_TREE: WizardNode[] = [
  {
    id: 'a-inicio',
    kind: 'question',
    question: '¿Qué hace el equipo?',
    help: 'Esta guía no incluye códigos por marca. Si hay un código, manda el manual del fabricante.',
    options: [
      { label: 'Hay un código de error', next: 'a-codigo' },
      { label: 'La exterior no arranca', next: 'a-exterior' },
      { label: 'Arranca pero no enfría', next: 'a-enfria' },
      { label: 'Hiela la tubería o la batería', next: 'a-hielo' },
      { label: 'Gotea dentro', next: 'a-goteo' },
    ],
  },
  {
    id: 'a-codigo',
    kind: 'result',
    result: 'El código es del fabricante, no un número universal.',
    actions: [
      'Anótalo y ábrelo en el manual de esa marca y ese modelo.',
      'En errores de comunicación, revisa la interconexión: orden, sección y ausencia de empalmes. La línea de señal puede tener tensión.',
    ],
    measurements: [
      '230 V en la alimentación de la exterior y continuidad de la señal, con el criterio del manual.',
    ],
  },
  {
    id: 'a-exterior',
    kind: 'question',
    question: '¿Hay 230 V en la alimentación de la unidad exterior?',
    safety:
      'Mide con puntas aisladas. No abras el circuito de gas: hace falta el certificado de gases fluorados y hay que recuperar la carga.',
    options: [
      { label: 'No hay tensión', next: 'a-tension' },
      { label: 'Hay tensión y el equipo no es inverter', next: 'a-condensador' },
      { label: 'Hay tensión y es inverter', next: 'a-inverter' },
    ],
  },
  {
    id: 'a-tension',
    kind: 'result',
    result: 'El equipo no tiene alimentación.',
    actions: [
      'Revisa el PIA y el diferencial del circuito de aire, normalmente el C9.',
      'Sigue el cable de interconexión: un empalme flojo deja la exterior muda.',
    ],
    links: [{ to: '/chuletas', label: 'Ver el C9 en la ITC-BT-25' }],
  },
  {
    id: 'a-condensador',
    kind: 'result',
    result: 'En un equipo de arranque por condensador, ese componente es el primer sospechoso.',
    actions: [
      'Corta tensión y descarga el condensador antes de tocarlo.',
      'Mide los microfaradios. Si se sale de un 5 a un 10 % o está hinchado, se cambia por el valor de la placa.',
    ],
  },
  {
    id: 'a-inverter',
    kind: 'result',
    result:
      'La potencia de un inverter no se diagnostica cambiando el condensador de arranque: no lo tiene.',
    actions: [
      'Revisa alimentación, comunicación y sensores según el manual.',
      'Placa o módulo de potencia: servicio técnico, con el código delante.',
    ],
  },
  {
    id: 'a-enfria',
    kind: 'result',
    result: 'El compresor gira pero el intercambio no cuadra.',
    actions: [
      'Mide el salto de aire con el equipo estable, al menos 15 minutos, a plena carga o en modo test.',
      'Limpia filtro, batería interior y condensadora antes de hablar de gas.',
      'Busca aceite en abocardados, válvulas y soldaduras.',
    ],
    measurements: ['Salto térmico de aire y, si hay tomas, recalentamiento y subenfriamiento.'],
    links: [{ to: '/calc/clima', label: 'Abrir salto térmico y SH/SC' }],
  },
  {
    id: 'a-hielo',
    kind: 'result',
    result: 'Hielo: poco caudal de aire o evaporación demasiado baja.',
    actions: [
      'Filtro, turbina y batería primero.',
      'Si el caudal es bueno y sigue helando, falta gas o el expansor no regula. No añadas refrigerante a ciegas.',
    ],
    links: [{ to: '/calc/clima', label: 'Comprobar el salto' }],
  },
  {
    id: 'a-goteo',
    kind: 'result',
    result: 'El agua condensada no sale.',
    actions: [
      'Pendiente del desagüe continua, sin sifones improvisados ni el extremo sumergido.',
      'Limpia la bandeja. Un desagüe tapado parece una fuga de gas y no lo es.',
    ],
  },
]
