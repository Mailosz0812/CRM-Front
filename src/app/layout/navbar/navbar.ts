import {Component, HostListener, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {UserStateService} from '../../core/user/user-state.service';
import {User} from '../../core/user/user';
import {AsyncPipe} from '@angular/common';
import {ButtonSmall} from '../../shared/button-small/button-small';
import {AuthService} from '../../core/auth/auth.service';
import {ROLE_HOME_PAGES} from '../../core/auth/role.routes';
import {map, Observable} from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    AsyncPipe,
  ],
  templateUrl: './navbar.html',
})
export class Navbar{
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  _basePath!: Observable<string>;
  constructor(public userState: UserStateService,public authService: AuthService) {
    this._basePath = this.userState._stateSub.pipe(
      map(user => user ? ROLE_HOME_PAGES[user.role] : '/')
    );
  }

  onToggleMobileMenu(){
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.isUserMenuOpen = false;
  }

}
