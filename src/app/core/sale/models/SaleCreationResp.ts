import {SaleStages} from './Stage.model';
import {ProductUnit} from '../../pricelist/models/unit.model';

export interface SaleCreationResp{
  saleId: string,
  saleData: string,
  stage: SaleStages,
  warehouseNote: string,
  saleItems: SaleItemResp[],
  sumPrice: string,
  saleName: string,
  clientName: string,
  clientId: string,
  createdAt: string
}
export interface SaleItemResp{
  saleItemId: string,
  prodId: string,
  name: string,
  internal: string,
  unitPrice: string,
  unit: ProductUnit,
  amount: string,
  sumPrice: string
}
