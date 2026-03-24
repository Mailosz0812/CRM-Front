import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ClientCreation} from './models/client-creation';
import {catchError, Observable} from 'rxjs';
import {ClientShortResp} from './models/client-short-resp';
import {ClientDashboardInfo} from './models/client-dashboard-info';


@Injectable({
  providedIn: 'root'
})
export class ClientService{
  private baseUrl: string = 'http://localhost:8080/Crm/client';
  constructor(private client: HttpClient){}

  createClient(client: ClientCreation): Observable<ClientCreationResp>{
    return this.client.post<ClientCreationResp>(this.baseUrl,client);
  }

  getClientsList(): Observable<ClientShortResp[]>{
    const url = this.baseUrl + '/list'
    return this.client.get<ClientShortResp[]>(url);
  }
  getDashboardInfo(id: string): Observable<ClientDashboardInfo> {
    const url = this.baseUrl + '/view/' + id;
    return this.client.get<ClientDashboardInfo>(url);
  }
  getClientDetails(id: string): Observable<ClientCreationResp>{
    const url = this.baseUrl + '/' + id;
    return this.client.get<ClientCreationResp>(url);
  }
}
