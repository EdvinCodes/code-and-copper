import type { WizardNode } from '../../engine/wizard.ts'

export const DIFFERENTIAL_START = 'd-inicio'

export const DIFFERENTIAL: WizardNode[] = [
  {
    id: 'd-inicio',
    kind: 'question',
    question: '¿Qué hace el diferencial cuando lo rearmas?',
    help: 'Anota si hay lluvia, un aparato concreto o electrónica de potencia en casa.',
    options: [
      { label: 'Dispara al momento o no llega a rearmar', next: 'd-pias' },
      { label: 'Rearma y dispara más tarde, sin un patrón claro al principio', next: 'd-tarde' },
    ],
  },
  {
    id: 'd-pias',
    kind: 'question',
    question:
      'Baja todos los PIA, rearma el diferencial y súbelos uno a uno. ¿Hay un circuito que lo tira?',
    safety:
      'No trabajes el cuadro con las manos mojadas. Si el diferencial no rearma ni con todos los PIA abajo, para.',
    options: [
      { label: 'Sí, un circuito lo dispara', next: 'd-circuito' },
      { label: 'Dispara con todos los PIA abajo', next: 'd-propio' },
    ],
  },
  {
    id: 'd-circuito',
    kind: 'question',
    question: 'En ese circuito, desenchufa los receptores y prueba otra vez.',
    options: [
      { label: 'Deja de disparar al quitar un aparato', next: 'd-aparato' },
      { label: 'Sigue disparando con todo desenchufado', next: 'd-cable' },
    ],
  },
  {
    id: 'd-aparato',
    kind: 'result',
    result: 'La fuga está en un receptor, no en la instalación fija.',
    actions: [
      'Vuelve a conectar de uno en uno hasta que dispare.',
      'Ese aparato se mide aparte o se retira. No lo dejes puenteado en el cuadro.',
    ],
    measurements: [
      'Con pinza de fugas, abraza fase y neutro del aparato en marcha. Lo que leas es su fuga.',
    ],
  },
  {
    id: 'd-cable',
    kind: 'result',
    result:
      'La derivación está en el cableado, una caja, un tubo exterior o un neutro tocando tierra.',
    actions: [
      'Corta tensión con las cinco reglas antes de abrir cajas.',
      'Secciona el circuito por tramos. Empieza por exteriores, jardín y bornas de unidades de fuera.',
    ],
    measurements: [
      'Aislamiento sin tensión y sin receptores, a 500 V DC, entre fase-tierra, neutro-tierra y fase-neutro. El mínimo de una instalación hasta 500 V es 0,5 MΩ. Una instalación sana da cientos.',
    ],
    links: [{ to: '/chuletas', label: 'Ver el mínimo de aislamiento' }],
  },
  {
    id: 'd-propio',
    kind: 'result',
    result:
      'O el diferencial está averiado, o hay un neutro aguas arriba mezclado, o la fuga está antes de los PIA.',
    actions: [
      'Pulsa el botón de test. Si no dispara, el aparato no sirve.',
      'Revisa que cada neutro vuelva a su propio diferencial. Un neutro cruzado dispara sin fuga franca.',
    ],
    measurements: [
      'Con un comprobador, el disparo tiene que caer entre 15 y 30 mA y en menos de 300 ms.',
    ],
  },
  {
    id: 'd-tarde',
    kind: 'question',
    question: 'Cuando dispara más tarde, ¿hay un patrón?',
    options: [
      { label: 'Coincide con lluvia o riego', next: 'd-lluvia' },
      { label: 'Coincide con un aparato', next: 'd-pinza' },
      { label: 'No hay patrón, o hay mucha electrónica', next: 'd-suma' },
      { label: 'Hay aerotermia, inverter, coche o fotovoltaica', next: 'd-clase' },
    ],
  },
  {
    id: 'd-lluvia',
    kind: 'result',
    result: 'Humedad en un tramo exterior.',
    actions: [
      'Revisa cajas de jardín, tubos a la intemperie y bornas de unidades exteriores.',
      'No tapes una caja mojada: sécala y vuelve a aislar.',
    ],
    measurements: ['Aislamiento del circuito exterior, por tramos, a 500 V DC.'],
  },
  {
    id: 'd-pinza',
    kind: 'result',
    result: 'Ese aparato fuga al funcionar, no en reposo.',
    actions: [
      'Mide con la pinza abrazando fase y neutro, en marcha.',
      'Si es un motor o una resistencia con humedad, fuera del circuito hasta repararlo.',
    ],
  },
  {
    id: 'd-suma',
    kind: 'result',
    result: 'Puede ser la suma de fugas y armónicos, no una derivación franca.',
    actions: [
      'Objetivo de buena práctica: la fuga permanente no debería pasar del 30 % de la sensibilidad, unos 9 mA en un diferencial de 30 mA.',
      'Reparte circuitos en más diferenciales o usa uno superinmunizado si el fabricante del cuadro lo admite.',
      'Mira también el protector de sobretensiones: a veces fuga él.',
    ],
  },
  {
    id: 'd-clase',
    kind: 'result',
    result: 'La clase del diferencial no corresponde a la carga.',
    actions: [
      'Variador monofásico, aerotermia o split inverter: clase F, o un superinmunizado si el fabricante del equipo lo acepta.',
      'Variador trifásico, cargador sin RDC-DD o inversor sin separación: clase B cuando el fabricante lo pida.',
      'El circuito del coche lleva diferencial exclusivo.',
    ],
    links: [{ to: '/cuadro', label: 'Ver las clases en el cuadro' }],
  },
]
