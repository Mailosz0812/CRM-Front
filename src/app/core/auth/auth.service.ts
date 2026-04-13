import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {catchError, Observable, tap} from 'rxjs';
import {LoginRequest} from './models/login.request';
import {LoginResponse} from './models/login.response';
import {UserStateService} from '../user/user-state.service';
import {User} from '../user/user';
import {ROLE_HOME_PAGES} from './role.routes';
import {environment} from '../../../environments/environment';

@Injectable({providedIn: "root"})
export class AuthService{
  private baseUrl =  `${environment.apiUrl}/auth`;
  private logoutTimer: any;

  constructor(private client: HttpClient, private router: Router, private userState: UserStateService) {
  }

  login(mail: string,password: string): Observable<LoginResponse>{
    return this.client.post<LoginResponse>(this.baseUrl,new LoginRequest(mail,password))
      .pipe(
        tap(resData => {
          this.handleAuthentication(resData)
        }));
  }
  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('expireDate');

    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
    this.logoutTimer = null;
    this.userState.setUser(null);
    this.router.navigate(['login']);
  }

  setToken(token: string){
    localStorage.setItem('token',token);
  }

  getToken(){
    return localStorage.getItem('token');
  }

  autoLogin(){
    const token = this.getToken();
    const expireDateStr = localStorage.getItem('expireDate');

    if(!token || !expireDateStr){
      return;
    }
    const expireDate = new Date(expireDateStr);
    const now = new Date();
    const expiresIn = expireDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.autoLogout(expiresIn);
    } else {
      this.logout();
    }

  }

  autoLogout(expirationDuration: number){
    this.logoutTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }


  private handleAuthentication(response: LoginResponse){
    const expireDate =  new Date(new Date().getTime() + response.expiresIn)
    this.setToken(response.token);
    localStorage.setItem('expireDate', expireDate.toISOString());
    this.userState.setUser(response.userInfo);
    this.autoLogout(response.expiresIn);
    const target = ROLE_HOME_PAGES[response.userInfo.role];
    this.router.navigate([target]);
  }

}
