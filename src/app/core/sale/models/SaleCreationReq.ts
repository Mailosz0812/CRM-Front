import {ProductUnit} from '../../pricelist/models/unit.model';

export interface SaleCreationReq{
  saleName: string,
  clientId: string,
  saleData: string,
  warehouseNote: string,
  saleItems: SaleItem[],
  customItems: SaleScratchItem[]
}

export interface SaleItem{
  prodId: string,
  amount: string,
  unitPrice: string,
  unit: ProductUnit,
  tps: string,
  pack: string,
}

export interface SaleScratchItem{
  name: string,
  internal: string,
  unitPrice: string,
  unit: ProductUnit,
  amount: string,
  tps: string,
  pack: string
}
