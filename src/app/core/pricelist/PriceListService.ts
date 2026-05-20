import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {PriceList} from './models/PriceList';
import {ListItem, PriceListResponse, ShortPriceList} from './models/price-list-response';
import {PriceListShort} from './models/price-list-short';
import {EMPTY, tap} from 'rxjs';
import {PriceListUpdate} from './models/price-list-update';
import {environment} from '../../../environments/environment';
import {BasePriceList, BasePriceListResponse} from './models/BasePrice-list';

@Injectable({
  providedIn: "root"
})
export class PriceListService{
  private baseUrl = `${environment.apiUrl}/prices`
  constructor(private client: HttpClient) {}


  createPriceList(priceList: PriceList){
    return this.client.post<PriceListResponse>(this.baseUrl,priceList);
  }

  patchBasePriceList(baseList: BasePriceList){
    const url = this.baseUrl + '/base'
    return this.client.patch<BasePriceListResponse>(url,baseList);
  }

  getBasePriceList(){
    const url = this.baseUrl + '/base'
    return this.client.get<BasePriceListResponse>(url);
  }

  getPriceListByClientId(clientId: string){
    const url = this.baseUrl + '/list/' + clientId
    return this.client.get<PriceListShort[]>(url);
  }

  getListItemsByListId(listId: string){
    const url = this.baseUrl + '/items/' + listId;
    return this.client.get<ListItem[]>(url).pipe(
      tap(value => {
        console.log(value);
      })
    );
  }
  getLatestItemsByClientId(clientId: string){
    const url = this.baseUrl + '/client/' + clientId;
    return this.client.get<ShortPriceList>(url);
  }

  updateListItems(updateReq: PriceListUpdate){
    console.log(updateReq);
    const url = this.baseUrl + '/list'

    return this.client.patch<PriceListResponse>(url,updateReq);
  }
  getPriceListPrint(id: string){
    const url = this.baseUrl + '/list/'+ id+'/print';
    return this.client.get(url,{
      responseType: 'blob'
    });
  }

}
