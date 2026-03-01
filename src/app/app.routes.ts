import { Routes } from '@angular/router';
import {AdminDashboard} from './features/admin-dashboard/admin-dashboard';

export const routes: Routes = [
  {
    path:'',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import("./features/login-form/login-form").then(c => c.LoginForm)
  },
  {
    path: 'admin', component: AdminDashboard,
    children: [
      { path: '', loadComponent: () => import("./features/admin-dashboard/admin-main/admin-main").then(c => c.AdminMain), pathMatch: 'full'},
      { path: 'clients', loadComponent: () => import("./features/clients/clients").then(c => c.Clients)},
      { path: 'sales',loadComponent: () => import("./features/sales/sales").then(c => c.Sales)}
    ]
  },
  {
    path: 'salesman', loadComponent: () => import("./features/salesman-dashboard/salesman-dashboard").then(c => c.SalesmanDashboard),
    children: [
      { path: '', loadComponent: () => import("./features/salesman-dashboard/salesman-main/salesman-main").then(c => c.SalesmanMain)},
      { path: 'clients', loadComponent: () => import("./features/clients/clients").then(c => c.Clients)},
      { path: 'sales',loadComponent: () => import("./features/sales/sales").then(c => c.Sales)}
    ]
  }
];
