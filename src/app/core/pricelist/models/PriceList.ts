import {ProductUnit} from './unit.model';
import {Category} from './category';


export interface PriceList{
  listTitle: string,
  clientId: string,
  items: ListProduct,
  baseItems: BaseItem[]
}
export interface ListProduct{
  name: string,
  internalName: string,
  unitPrice: string,
  unit: ProductUnit,
  producer: string,
  tps: string,
  pack: string,
  categoryId: Category
}
export interface BaseItem{
  prodId: string,
  unitPrice: string,
  unit: ProductUnit,
  tps: string
}

