# Code & Copper

Copiloto de campo y estudio para quien junta software, electricidad y clima. Pensado para abrir en el móvil, en un sótano o al sol, y para seguir funcionando sin cobertura.

La interfaz está en español. Los cálculos usan la normativa española y europea vigente a 29 de octubre de 2026: 230/400 V, 50 Hz y secciones en mm². Cada tabla lleva su fuente en el código. Lo que todavía está en tramitación (nuevo REBT, real decreto de gases fluorados, reforma del RITE) se marca como no vigente.

## Qué hay dentro

- Sección de cable, caída de tensión y protección, con intensidades de la UNE-HD 60364-5-52:2022 corregidas a 40 °C.
- Ley de Ohm y triángulo de potencias.
- Carga térmica estimada, salto térmico, recalentamiento, subenfriamiento y caudal de aerotermia.
- Chuletas de la ITC-BT-25, colores, cables, KNX, refrigerantes y trámites de Canarias.
- Cuadro de carril con fichas y esquemas de telerruptor y contactor.
- Diagnóstico paso a paso de diferencial, magnetotérmico y split.
- Arsenal de banco, maletín, frío y redes, guardado en el dispositivo.

Los resultados son orientativos. No sustituyen un proyecto, una memoria técnica, el manual del fabricante ni la verificación de un instalador habilitado.

## Desarrollo

Hace falta Node 24 y pnpm 10.

```bash
pnpm install
pnpm dev
pnpm test
pnpm check
pnpm build
pnpm preview
```

La aplicación publicada está en [edvincodes.github.io/code-and-copper](https://edvincodes.github.io/code-and-copper/). Desde el navegador del móvil se puede instalar en la pantalla de inicio. El service worker precarga la aplicación, así que abre también en modo avión.

## Datos

Los números de conductividad salen de la Guía técnica del REBT, anexo 2. Las intensidades admisibles salen de las tablas detalladas de la UNE-HD 60364-5-52:2022 a 40 °C, no de la tabla simplificada antigua. Las presiones de saturación salen de CoolProp 8. La fecha de contraste está en Ajustes.
