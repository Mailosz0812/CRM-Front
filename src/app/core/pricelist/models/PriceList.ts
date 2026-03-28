import {ProductUnit} from './unit.model';
import {Category} from './category.model';


export interface PriceList{
  listTitle: string,
  clientId: string,
  items: ListProduct;
}
export interface ListProduct{
  name: string,
  unitPrice: string,
  unit: ProductUnit,
  prodCategory: Category
}
