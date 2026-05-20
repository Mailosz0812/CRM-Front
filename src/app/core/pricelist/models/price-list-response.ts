import {ProductUnit} from './unit.model';

export interface PriceListResponse{
  id: string,
  listTitle: string,
  createdAt: string,
  productsList: ListItem[]
}

export interface ShortPriceList{
  id: string,
  items: ListItem[]
}
export interface ListItem{
  id: string | null,
  name: string,
  internal: string,
  unitPrice: string,
  unit: ProductUnit,
  producer: string
  tps: string,
  pack: string,
  category: string
}
