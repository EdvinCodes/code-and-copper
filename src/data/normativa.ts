import { DATA_VERIFIED_AT } from './meta.ts'

export { DATA_VERIFIED_AT }

export const IN_FORCE = [
  {
    name: 'REBT',
    detail:
      'Real Decreto 842/2002. Texto consolidado del BOE a 3 de septiembre de 2025. Incluye la ITC-BT-52 del RD 1053/2014.',
  },
  {
    name: 'ITC-BT-02',
    detail:
      'Resolución de 20 de marzo de 2025. UNE-HD 60364-5-52:2022 y A12:2023 obligatoria desde el 1 de octubre de 2025. También UNE-EN 62423 y UNE-HD 60364-4-41:2018.',
  },
  {
    name: 'Guías técnicas',
    detail: 'Las del Ministerio aclaran, no sustituyen al reglamento. No son vinculantes.',
  },
  {
    name: 'RITE',
    detail:
      'RD 1027/2007. La última reforma de fondo es el RD 178/2021, en vigor desde el 1 de julio de 2021.',
  },
  {
    name: 'Gases fluorados',
    detail:
      'Reglamento (UE) 2024/573. En España sigue el RD 115/2017: los certificados los expiden las comunidades autónomas.',
  },
  {
    name: 'RSIF',
    detail: 'RD 552/2019, junto con la UNE-EN 378, para refrigerantes inflamables como el R290.',
  },
  { name: 'Trabajos sin tensión', detail: 'RD 614/2001. Las cinco reglas de oro.' },
] as const

export const PENDING_RULES = [
  {
    name: 'Nuevo REBT',
    detail:
      'Consulta europea desde julio de 2025. No está publicado. El borrador habla de diferencial tipo A en lugar de AC, protector de sobretensiones obligatorio y una ITC de corriente continua y baterías. Nada de eso obliga todavía.',
  },
  {
    name: 'Nuevo real decreto de gases',
    detail:
      'Información pública en 2025 e informe de la CNMC el 18 de marzo de 2026. A fecha de contraste no consta en el BOE. Sigue el RD 115/2017.',
  },
  {
    name: 'Reforma del RITE',
    detail:
      'Consulta previa de marzo y abril de 2025 para transponer la Directiva 2024/1275. Sin real decreto nuevo publicado.',
  },
] as const

export const CANARIAS = [
  {
    name: 'Decreto 141/2009',
    detail:
      'Autorización y legalización de instalaciones eléctricas en Canarias. La documentación depende del anexo VII.',
  },
  {
    name: 'Procedimiento 3158',
    detail:
      'Comunicación previa de puesta en servicio de instalaciones nuevas, e inscripción en el registro.',
    href: 'https://sede.gobiernodecanarias.org/sede/tramites/3158',
  },
  {
    name: 'Procedimiento 6782',
    detail: 'Modificación, reforma o reactivación de una instalación que ya existe.',
    href: 'https://sede.gobiernodecanarias.org/sede/tramites/6782',
  },
  {
    name: 'Edistribución',
    detail:
      'Especificaciones particulares: NRZ101, NRZ103 para el enlace de consumidores y NRZ105 para generadores. La distribuidora no conecta sin el certificado diligenciado.',
  },
] as const

export const BOE_REBT = 'https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099'
