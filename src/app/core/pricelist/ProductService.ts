import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn:'root'
})
export class ProductService{
  private url = `${environment.apiUrl}/product`
  constructor(private client: HttpClient) {}

  getProducts(){
    const path = this.url + '/producers';
    return this.client.get<string[]>(path);
  }

}
