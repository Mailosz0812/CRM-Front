export const PRODUCT_UNITS = ['KARTON', 'KG', 'SZT'] as const

export type ProductUnit = typeof PRODUCT_UNITS[number];
