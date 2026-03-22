import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {catchError, Observable, tap} from 'rxjs';
import {LoginRequest} from './models/login.request';
import {LoginResponse} from './models/login.response';
import {UserStateService} from '../user/user-state.service';
import {User} from '../user/user';
import {ROLE_HOME_PAGES} from './role.routes';

@Injectable({providedIn: "root"})
export class AuthService{
  private baseUrl = 'http://localhost:8080/Crm/auth';

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
    this.userState.setUser(null);
    this.router.navigate(['login']);
  }

  setToken(token: string){
    localStorage.setItem('token',token);
  }

  getToken(){
    return localStorage.getItem('token');
  }


  private handleAuthentication(response: LoginResponse){
    const expireDate =  new Date(new Date().getTime() + response.expiresIn)
    this.setToken(response.token);
    this.userState.setUser(response.userInfo);
    const target = ROLE_HOME_PAGES[response.userInfo.role];
    this.router.navigate([target]);
  }

}
