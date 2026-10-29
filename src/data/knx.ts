export const KNX_FACTS = [
  {
    title: 'Cable',
    text: 'YCYM o J-Y(St)Y 2x2x0,8, apantallado, cubierta verde y ensayo a 4 kV. El par de trabajo es rojo (+) y negro (−). Blanco y amarillo son reserva.',
  },
  {
    title: 'Separación',
    text: 'Al menos 4 mm entre los hilos del bus y los de red, o un aislamiento equivalente. Se puede tender junto a la potencia si el cable está certificado.',
  },
  {
    title: 'Alimentación',
    text: '30 V DC SELV. Los dispositivos trabajan desde unos 21 V. Una fuente de 640 mA da para unos 64 dispositivos de 200 mW, repartidos en la línea.',
  },
  {
    title: 'Distancias',
    text: 'Segmento hasta 1000 m. Fuente a dispositivo, 350 m. Entre dispositivos, 700 m. No lleva resistencia de terminación.',
  },
  {
    title: 'Direcciones',
    text: 'La dirección física es área.línea.dispositivo. Las direcciones de grupo son los temas: quien publica no sabe quién escucha. ETS es el compilador y el despliegue.',
  },
] as const
