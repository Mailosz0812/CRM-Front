import {ListItem} from './price-list-response';

export interface BasePriceList {
  productList: ProductOperation[];
}

export interface ProductOperation {
  delete: boolean;
  prodReq: ListItem;
}

export interface BasePriceListResponse{
  id: string;
  productList: ListItem[];
}
