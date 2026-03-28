import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {PriceList} from './models/PriceList';
import {ListItem, PriceListResponse} from './models/price-list-response';
import {PriceListShort} from './models/price-list-short';

@Injectable({
  providedIn: "root"
})
export class PriceListService{
  private baseUrl = 'http://localhost:8080/Crm/prices'
  constructor(private client: HttpClient) {}


  createPriceList(priceList: PriceList){
    console.log(priceList);
    return this.client.post<PriceListResponse>(this.baseUrl,priceList);
  }

  getPriceListByClientId(clientId: string){
    const url = this.baseUrl + '/list/' + clientId
    return this.client.get<PriceListShort[]>(url);
  }

  getListItemsByListId(listId: string){
    const url = this.baseUrl + '/items/' + listId;
    return this.client.get<ListItem[]>(url);
  }
}
