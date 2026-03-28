import {ListProduct} from './PriceList';

export interface PriceListResponse{
  id: string,
  listTitle: string,
  createdAt: string,
  productsList: ListProduct
}

export interface ListItem{
  id: string,
  cacheId: string,
  name: string,
  unitPrice: string,
  visibility: boolean
}
