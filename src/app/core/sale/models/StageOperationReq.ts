import {SaleStages} from './Stage.model';

export interface StageOperationReq{
  saleId: string,
  stage: SaleStages,
  packageDate: string | null,
}
