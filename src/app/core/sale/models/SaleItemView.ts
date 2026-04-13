import {ProductUnit} from '../../pricelist/models/unit.model';

export interface SaleItemView{
  prodId: string | null
  name: string,
  internal: string,
  unitPrice: string,
  unit: ProductUnit,
  amount: string,
  sum: number
}
