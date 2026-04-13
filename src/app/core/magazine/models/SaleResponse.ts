import {ProductUnit} from '../../pricelist/models/unit.model';

export interface SaleResponse{
  saleId: string,
  saleName: string
  warehouseNote: string,
  itemsList: SaleItemWarehouseView[],
  createdAt: string,
  checkedAt: string,
  packageDate: string,
  clientName: string,
  clientNip: string
}

export interface SaleItemWarehouseView{
  saleItemId: string,
  name: string,
  unit: ProductUnit,
  amount: string,
  internal: string
}
