import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {PriceList} from './models/PriceList';
import {ListItem, PriceListResponse} from './models/price-list-response';
import {PriceListShort} from './models/price-list-short';
import {tap} from 'rxjs';
import {PriceListUpdate} from './models/price-list-update';

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
    return this.client.get<ListItem[]>(url).pipe(
      tap(value => {
        console.log(value);
      })
    );
  }

  updateListItems(listItems: ListItem[], priceListId: string){
    const url = this.baseUrl + '/list'
    const updateReq: PriceListUpdate = {
      listId: priceListId,
      products: listItems
    }
    return this.client.patch<PriceListResponse>(url,updateReq);
  }
}
