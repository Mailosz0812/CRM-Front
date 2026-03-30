import {ListProduct} from '../../pricelist/models/PriceList';
import {ListItem} from '../../pricelist/models/price-list-response';

export interface ClientDashboardInfo{
  clientInfo: ClientWidgetInfo,
  recentSales: ShortSaleResp[],
  recentPrices: ListItem[]
}

export interface ClientWidgetInfo{
  name: string,
  nipNumber: string,
  address: string,
  phone: string
}

export interface ShortSaleResp{
  saleId: string,
  saleData: string,
  stage: string,
  sumPrice: string
}
