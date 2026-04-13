export const SALE_STAGES = [
  'NOWA',
  'ODRZUCONA',
  'DO_REALIZACJI',
  'W_TRAKCIE_PAKOWANIA',
  'SPAKOWANA',
  'ZAKONCZONA_NIEKOMPLETNA',
  'ZWROCONA',
  'ZAKONCZONA'
] as const

export type SaleStages = typeof SALE_STAGES[number];
