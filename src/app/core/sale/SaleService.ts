import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SaleCreationResp} from './models/SaleCreationResp';
import {SaleCreationReq} from './models/SaleCreationReq';
import {ShortSaleResp} from '../client/models/client-dashboard-info';
import {StageOperationReq} from './models/StageOperationReq';
import {SaleUpdateReq} from './models/SaleUpdateReq';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: "root"
})
export class SaleService{
  private url = `${environment.apiUrl}/sales`;
  constructor(private client: HttpClient) {}

  createSale(req: SaleCreationReq){
    return this.client.post<SaleCreationResp>(this.url,req)
  }

  getAllSales(){
    return this.client.get<ShortSaleResp[]>(this.url);
  }

  getSaleDetails(saleId: string){
    const path = this.url + '/' + saleId;
    return this.client.get<SaleCreationResp>(path)
  }
  changeSaleStage(stageOp: StageOperationReq){
    const path = this.url + '/stage';
    return this.client.post<SaleCreationResp>(path,stageOp);
  }

  updateSale(sale: SaleUpdateReq){
    return this.client.put<SaleCreationResp>(this.url,sale);
  }

}
