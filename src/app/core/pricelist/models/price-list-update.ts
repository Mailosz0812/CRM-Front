import {ListItem} from './price-list-response';
import {BaseItem} from './PriceList';

export interface PriceListUpdate{
  listId: string,
  products: ListItem[]
  baseItems: BaseItem[]
}
