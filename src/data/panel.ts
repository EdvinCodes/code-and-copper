export type PanelModule = {
  id: string
  short: string
  name: string
  width: number
  tone: string
  what: string
  spec: string
  wiring: string
  mistakes: string
  software: string
}

export const PANEL_MODULES: PanelModule[] = [
  {
    id: 'iga',
    short: 'IGA',
    name: 'Interruptor general automático',
    width: 2,
    tone: '#7f1d1d',
    what: 'Corta toda la instalación de la vivienda. Es el kill switch: una sola llamada y el proceso entero se detiene.',
    spec: 'En electrificación básica, al menos 25 A. En elevada, 40 A. Poder de corte mínimo 4,5 kA; 6 kA es la elección sensata en vivienda.',
    wiring:
      'Aguas arriba de los diferenciales, alimentado desde la derivación individual. Corta fase y neutro.',
    mistakes:
      'Usarlo como único magnetotérmico de un circuito de fuerza. No es selectivo con los PIA si el cortocircuito es franco.',
    software:
      'Un interruptor global delante del resto de middlewares. Si salta, el fallo está antes de los circuitos o la suma se ha pasado.',
  },
  {
    id: 'spd',
    short: 'SOB',
    name: 'Protector de sobretensiones',
    width: 4,
    tone: '#92400e',
    what: 'Valida la entrada. Las transitorias son picos de rayo o de maniobra. Las permanentes aparecen cuando se pierde el neutro y la fase se va hacia 400 V.',
    spec: 'La ITC-BT-52 los exige en la recarga del vehículo. El borrador del nuevo REBT los quiere en toda instalación nueva, pero eso aún no obliga.',
    wiring:
      'Justo aguas abajo del IGA, con su propio PIA de desconexión si el fabricante lo pide. Tierra corta y directa al embarrado de protección.',
    mistakes:
      'Un cable de tierra largo anula el protector: el pico no espera. Tampoco sirve uno solo de transitorias si el riesgo es la pérdida de neutro.',
    software:
      'Un WAF delante de la aplicación. Tira la petición mala y, si la línea se vuelve hostil, corta el servicio.',
  },
  {
    id: 'id-a',
    short: 'ID A',
    name: 'Diferencial 30 mA tipo A',
    width: 2,
    tone: '#1e3a8a',
    what: 'Comprueba que la corriente que sale por la fase vuelve por el neutro. Si falta más de 30 mA, hay una fuga a tierra.',
    spec: 'Dispara entre 15 y 30 mA, en menos de 300 ms a IΔn y en menos de 40 ms a 5·IΔn. Uno por cada cinco circuitos de vivienda. La clase AC solo ve senoidal; el borrador nuevo quiere dejar de instalarla.',
    wiring:
      'Aguas abajo del protector y aguas arriba de los PIA de C1 a C5. Fase y neutro de esos circuitos, y solo de esos.',
    mistakes:
      'Neutro compartido con otro diferencial: dispara sin que haya fuga. Mezclar el neutro del C13 aquí también.',
    software:
      'assert(I_fase === I_neutro). Un checksum de corrientes. Si el hash no cuadra, aborta.',
  },
  {
    id: 'id-f',
    short: 'ID F',
    name: 'Diferencial tipo F',
    width: 2,
    tone: '#155e75',
    what: 'Un tipo A que además aguanta frecuencias mezcladas hasta 1 kHz y una componente continua lisa de hasta 10 mA. Es el de la aerotermia monofásica, el split inverter y muchas lavadoras.',
    spec: 'UNE-EN 62423. El superinmunizado (A-SI / HPI) no es una clase distinta: es un tipo A más difícil de disparar por ruido.',
    wiring:
      'Circuito propio de la aerotermia o del inverter, no mezclado con el alumbrado si la suma de fugas ya va justa.',
    mistakes:
      'Poner un AC delante de un variador. El variador puede cegarlo o dispararlo sin fuga real.',
    software: 'Un checksum que entiende payloads binarios, no solo texto. El AC solo valida ASCII.',
  },
  {
    id: 'pia-c',
    short: 'PIA',
    name: 'Magnetotérmico',
    width: 1,
    tone: '#3f3f46',
    what: 'Dos protecciones en serie. El térmico, una lámina que se dobla con el calor, limita la sobrecarga. El magnético, una bobina, corta el cortocircuito.',
    spec: 'Curva B: 3 a 5 In, resistivo y líneas largas. Curva C: 5 a 10 In, uso general y obligatoria en vehículo eléctrico. Curva D: 10 a 20 In, motores. No dispara a 1,13 In en una hora; sí a 1,45 In.',
    wiring:
      'Aguas abajo de su diferencial. En vivienda, fase y neutro en 1P+N. El calibre no puede superar la Iz del cable.',
    mistakes:
      'Subir el calibre porque dispara, sin mirar la sección. Eso quita la protección y deja el cable de fusible.',
    software:
      'Circuit breaker. El térmico es un rate limit de ventana larga. El magnético es fail-fast.',
  },
  {
    id: 'id-ev',
    short: 'ID VE',
    name: 'Diferencial exclusivo del C13',
    width: 2,
    tone: '#166534',
    what: 'La recarga no comparte diferencial con el resto de la casa. Clase A como mínimo, 30 mA. En modo 3 hace falta cubrir corriente continua lisa de más de 6 mA: tipo B, o tipo A más un RDC-DD.',
    spec: 'ITC-BT-52. Si hay un diferencial de cabecera del circuito colectivo, tiene que ser selectivo respecto al de cada punto.',
    wiring:
      'Solo el circuito de recarga. PIA de curva C dimensionado al escalón elegido, con tope monofásico de 9200 W.',
    mistakes:
      'Un tipo AC, o un tipo A sin detección de 6 mA en un cargador modo 3 que no la traiga dentro.',
    software:
      'Un validador dedicado al endpoint del cargador, con un parser extra para la componente continua.',
  },
  {
    id: 'contactor',
    short: 'KM',
    name: 'Contactor 25 A 2NO',
    width: 2,
    tone: '#44403c',
    what: 'Un relé de potencia. La bobina manda y los contactos aguantan la carga. Separa el mundo de la electrónica del mundo de los amperios.',
    spec: 'Bobina de 230 V en este banco. Mando Auto/0/1 para probar a mano. Un RC snubber en la bobina recorta el pico al soltar.',
    wiring:
      'La bobina la gobierna el Shelly o el actuador KNX, no al revés. La potencia entra por los contactos, nunca por la borna de mando.',
    mistakes:
      'Conmutar una aerotermia o un cargador directamente con la salida del relé inteligente. Se quema la pista.',
    software:
      'Un adaptador de potencia. El snubber es el filtro que evita que el ruido de la bobina vuelva al micro.',
  },
  {
    id: 'telerruptor',
    short: 'TL',
    name: 'Telerruptor',
    width: 1,
    tone: '#3f3f46',
    what: 'Un biestable: cada pulso cambia de estado. Varios pulsadores en paralelo encienden la misma luz desde sitios distintos.',
    spec: '16 A en el banco. La bobina es de impulso, no está pensada para quedarse alimentada.',
    wiring:
      'Pulsadores en paralelo entre fase y la borna de bobina. El retorno de la bobina, a neutro. El contacto conmuta la lámpara.',
    mistakes:
      'Dejar un pulsador clavado. La bobina no es un contactor y se quema si recibe tensión continua.',
    software: 'Un flip-flop T. Cada flanco invierte Q. No guarda más estado que el último.',
  },
  {
    id: 'shelly',
    short: 'SH',
    name: 'Shelly Pro',
    width: 1,
    tone: '#0f766e',
    what: 'Un relé con API local: HTTP, RPC, MQTT y WebSocket. En carril, el Pro no vive de la nube para conmutar.',
    spec: 'Shelly Pro 1 o Pro 2. La salida de mando va a la bobina del contactor si la carga es grande.',
    wiring:
      'Alimentación de carril. Su contacto seco o su salida gobierna la bobina, con el snubber en paralelo.',
    mistakes:
      'Exponerlo a internet sin red propia, o hacerle cortar 25 A de una resistencia con el relé de la placa.',
    software:
      'Un microservicio local. Home Assistant es el cliente. Si el broker cae, el contactor puede quedarse en el último estado.',
  },
  {
    id: 'knx',
    short: 'KNX',
    name: 'Fuente y actuador KNX',
    width: 4,
    tone: '#166534',
    what: 'La fuente pone los 30 V del bus. El actuador escucha direcciones de grupo y mueve sus salidas. ETS programa las dos cosas.',
    spec: 'Fuente de 640 mA para una línea de prácticas. Actuador de salidas binarias hacia contactores, no hacia la carga grande.',
    wiring:
      'Rojo y negro al bus, sin invertirlos en un dispositivo y bien en el siguiente. La potencia del actuador, aparte, desde un PIA.',
    mistakes: 'Usar el par blanco/amarillo como si fuera otro bus de datos. Es reserva.',
    software:
      'Pub/sub. La dirección de grupo es el topic. Quien publica no sabe quién está suscrito.',
  },
]

export const SCHEMATICS = [
  {
    id: 'telerruptor',
    title: 'Telerruptor con pulsadores en paralelo',
    steps: [
      'Fase al común de los pulsadores. Los pulsadores van en paralelo: cualquiera cierra el circuito de la bobina.',
      'La salida de los pulsadores entra en la borna de bobina. El otro lado de la bobina, a neutro.',
      'El contacto de potencia del telerruptor lleva la fase a la lámpara. El neutro de la lámpara va directo.',
      'Cada pulsación es un flanco. Si mantienes el dedo, no es un regulador: es una bobina sufriendo.',
    ],
  },
  {
    id: 'contactor',
    title: 'Contactor gobernado por Shelly o por KNX',
    steps: [
      'La carga grande entra por los contactos de potencia del contactor, protegida por su PIA.',
      'La bobina de 230 V la cierra la salida del Shelly Pro o del actuador KNX. Esa salida no ve los amperios de la carga.',
      'Un RC snubber en paralelo con la bobina recorta el pico al abrir.',
      'El mando Auto/0/1 del contactor permite puentear la electrónica para probar la potencia sola.',
    ],
  },
] as const
