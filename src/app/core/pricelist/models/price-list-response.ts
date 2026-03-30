import {ProductUnit} from './unit.model';
import {Category} from './category.model';

export interface PriceListResponse{
  id: string,
  listTitle: string,
  createdAt: string,
  productsList: ListItem[]
}

export interface ListItem{
  id: string | null,
  name: string,
  unitPrice: string,
  category: Category,
  unit: ProductUnit
}
