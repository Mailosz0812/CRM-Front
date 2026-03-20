import {
  ActivatedRouteSnapshot,
  CanActivate,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import {AuthService} from './auth.service';
import {UserStateService} from '../user/user-state.service';
import {Injectable} from '@angular/core';
import {ROLE_HOME_PAGES} from './role.routes';

@Injectable({providedIn: 'root'})
export class GuestGuard implements CanActivate{
  constructor(private authService: AuthService, private userState: UserStateService, private router: Router){}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    const token = this.authService.getToken();
    const user = this.userState.getUserSnapshot()
    if (token && user) {
      const target = ROLE_HOME_PAGES[user.role];
      return this.router.createUrlTree([target || '/'])
    }
    return true;
  }

}
