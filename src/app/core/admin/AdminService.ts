import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AdminDashboardView} from './models/AdminDashboardView';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService{
  private url = `${environment.apiUrl}/users/admin`
  constructor(private client: HttpClient) {}

  getAdminDashboardInfo(){
    const path = this.url + "/view"
    return this.client.get<AdminDashboardView>(path);
  }

}
