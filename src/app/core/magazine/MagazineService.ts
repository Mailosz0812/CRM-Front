import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SaleResponse} from './models/SaleResponse';
import {PackReq} from './models/PackReq';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MagazineService{
  private url = `${environment.apiUrl}/users/magazine`;
  constructor(private client: HttpClient) {}

  getDailySales(maxDate: string | null){
    let path = this.url + '/daily';
    if(maxDate){
      const date = new Date(maxDate).toISOString();
      path = path + `?marginDate=${date}`;
    }
    return this.client.get<SaleResponse[]>(path);
  }

  checkAsPacked(packedReq: PackReq){
    const path = this.url + "/packed";
    return this.client.post(path,packedReq);
  }
}
