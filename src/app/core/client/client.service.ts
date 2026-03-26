import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ClientCreation} from './models/client-creation';
import {BehaviorSubject, catchError, EMPTY, Observable, switchMap, take, tap} from 'rxjs';
import {ClientShortResp} from './models/client-short-resp';
import {ClientDashboardInfo} from './models/client-dashboard-info';
import {Router} from '@angular/router';
import {UserStateService} from '../user/user-state.service';


@Injectable({
  providedIn: 'root'
})
export class ClientService{
  private baseUrl: string = 'http://localhost:8080/Crm/client';
  private _clientState = new BehaviorSubject<null | ClientResponse>(null);
  public clientState = this._clientState.asObservable();
  constructor(private client: HttpClient,private router: Router,private userState: UserStateService){}

  createClient(client: ClientCreation): Observable<ClientResponse>{
    return this.client.post<ClientResponse>(this.baseUrl,client)
      .pipe(
        tap((client) => {
          this._clientState.next(client);
        })
      );
  }

  getClientsList(): Observable<ClientShortResp[]>{
    const url = this.baseUrl + '/list'
    return this.client.get<ClientShortResp[]>(url);
  }
  getDashboardInfo(id: string): Observable<ClientDashboardInfo> {
    const url = this.baseUrl + '/view/' + id;
    return this.client.get<ClientDashboardInfo>(url);
  }
  getClientDetails(id: string): Observable<ClientResponse>{
    const url = this.baseUrl + '/' + id;
    return this.client.get<ClientResponse>(url)
      .pipe(
        tap((client) => {
          this._clientState.next(client);
        }),
        catchError(err => {
          return this.userState._basePath.pipe(
            take(1),
            tap(value => {
              this.router.navigate([value, 'clients']);
            }),
            switchMap(() => EMPTY)
          );
        })
      );
  }

  updateClientDetails(client: ClientUpdate): Observable<ClientResponse>{
    return this.client.put<ClientResponse>(this.baseUrl,client)
      .pipe(
        tap((client) => {
          this._clientState.next(client);
        })
      );
  }
}
