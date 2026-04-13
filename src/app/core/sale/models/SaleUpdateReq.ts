import {SaleItem, SaleScratchItem} from './SaleCreationReq';

export interface SaleUpdateReq{
  saleId: string,
  saleName: string,
  saleItems: SaleItem[],
  customItems: SaleScratchItem[]
}
