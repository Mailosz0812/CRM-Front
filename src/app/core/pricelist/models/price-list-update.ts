import {ListItem} from './price-list-response';

export interface PriceListUpdate{
  listId: string,
  products: ListItem[]
}
