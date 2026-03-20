import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {User} from './user';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private stateSubject = new BehaviorSubject<User | null>(null);
  readonly _stateSub = this.stateSubject.asObservable();

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
