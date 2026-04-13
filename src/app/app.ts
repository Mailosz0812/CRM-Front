import {Component, OnInit, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Navbar} from './layout/navbar/navbar';
import {AdminDashboard} from './features/admin-dashboard/admin-dashboard';
import {AuthService} from './core/auth/auth.service';

@Component({
  selector: 'app-root',
    imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{
  protected readonly title = signal('CrmFront');
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.autoLogin();
  }
}
