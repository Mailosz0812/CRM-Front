import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SalesmanView} from './models/SalesmanView';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SalesmanService{
  private url = `${environment.apiUrl}/users/salesman`
  constructor(private client: HttpClient) {}

  getSalesmanView(){
    const path = this.url + "/view"
    return this.client.get<SalesmanView>(path);
  }
}
