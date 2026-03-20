import { Routes } from '@angular/router';
import {AdminDashboard} from './features/admin-dashboard/admin-dashboard';
import {GuestGuard} from './core/auth/guest.guard';
import {AuthGuard} from './core/auth/auth.guard';


const commonRoutes: Routes = [
  { path: 'clients', loadComponent: () => import("./features/clients/clients").then(c => c.Clients)},
  { path: 'clients/new', loadComponent: () => import("./features/clients/client-creation-form/client-creation-form").then(c => c.ClientCreationForm)},
  { path: 'clients/details', loadComponent: () => import("./features/clients/client-details/client-details").then(c => c.ClientDetails)},
  {
    path: 'sales/new',
    loadComponent: () => import("./features/salesman-sales/sales-creation-form/sales-creation-form").then(c => c.SalesCreationForm)
  },
  {
    path: 'sales',
    loadComponent: () => import("./features/salesman-sales/salesman-sales").then(c => c.SalesmanSales)
  },
  {
    path: 'prices',
    loadComponent: () => import("./features/price-list/price-list").then(c => c.PriceList)
  }
]
export const routes: Routes = [
  {
    path:'',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    canActivate: [GuestGuard],
    loadComponent: () => import("./features/login-form/login-form").then(c => c.LoginForm)
  },
  {
    path: 'admin', component: AdminDashboard,
    canActivate: [AuthGuard],
    children: [
      { path: '', loadComponent: () => import("./features/admin-dashboard/admin-main/admin-main").then(c => c.AdminMain), pathMatch: 'full'},
      ...commonRoutes
    ]
  },
  {
    path: 'salesman', loadComponent: () => import("./features/salesman-dashboard/salesman-dashboard").then(c => c.SalesmanDashboard),
    canActivate: [AuthGuard],
    children: [
      { path: '', loadComponent: () => import("./features/salesman-dashboard/salesman-main/salesman-main").then(c => c.SalesmanMain), pathMatch: 'full'},
      ...commonRoutes
    ]
  },
  {
    path: 'magazine',
    canActivate: [AuthGuard],
    loadComponent: () => import("./features/sales/sales").then(c => c.Sales)
  }
];
