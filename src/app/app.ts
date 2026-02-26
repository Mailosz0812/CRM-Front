import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Navbar} from './layout/navbar/navbar';
import {AdminDashboard} from './features/admin-dashboard/admin-dashboard';

@Component({
  selector: 'app-root',
    imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('CrmFront');
}
