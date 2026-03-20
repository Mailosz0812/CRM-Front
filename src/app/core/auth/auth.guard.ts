import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import {AuthService} from './auth.service';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate{

  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean{
    const token = this.authService.getToken();
    if(token){
      return true;
    }else{
      this.router.navigate(['/login']);
      return false
    }
  }
}
