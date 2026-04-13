import {ListItem} from '../../pricelist/models/price-list-response';
import {SaleStages} from '../../sale/models/Stage.model';

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
  saleName: string,
  stage: SaleStages,
  sumPrice: string,
  clientName: string,
}
