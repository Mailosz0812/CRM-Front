import {ListItem, ShortPriceList} from '../../pricelist/models/price-list-response';
import {SaleStages} from '../../sale/models/Stage.model';

export interface ClientDashboardInfo{
  clientInfo: ClientWidgetInfo,
  recentSales: ShortSaleResp[],
  recentPrices: ShortPriceList
}

export interface ClientWidgetInfo{
  name: string,
  nipNumber: string,
  address: string,
  phone: string
}

export interface ShortSaleResp{
  saleId: string,
  saleName: string,
  stage: SaleStages,
  sumPrice: string,
  clientName: string,
}
