export const CATEGORIES = ['MIESO','NABIAL','WARZYWA','INNE'] as const

export type Category = typeof CATEGORIES[number];
