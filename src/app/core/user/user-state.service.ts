import {Injectable} from '@angular/core';
import {BehaviorSubject, map, Observable} from 'rxjs';
import {User} from './user';
import {ROLE_HOME_PAGES} from '../auth/role.routes';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private stateSubject = new BehaviorSubject<User | null>(null);
  readonly _stateSub = this.stateSubject.asObservable();
  _basePath = this.stateSubject.asObservable().pipe(
    map(user => user ? ROLE_HOME_PAGES[user.role] : '/')
  )

  constructor() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        this.stateSubject.next(JSON.parse(savedUser));

      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }
  setUser(user: User | null) {
    this.stateSubject.next(user);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }
  getUserSnapshot(): User | null {
    return this.stateSubject.value;
  }
}
