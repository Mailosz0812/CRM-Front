import {Component, OnInit} from '@angular/core';
import {ButtonSmall} from '../../../shared/button-small/button-small';
import {NoteSection} from '../../../layout/note-section/note-section';
import {Router, RouterLink} from '@angular/router';
import {UserStateService} from '../../../core/user/user-state.service';
import {async, Observable} from 'rxjs';
import {AsyncPipe, DecimalPipe, LowerCasePipe, UpperCasePipe} from '@angular/common';
import {SaleService} from '../../../core/sale/SaleService';
import {ShortSaleResp} from '../../../core/client/models/client-dashboard-info';
import {AdminDashboardView} from '../../../core/admin/models/AdminDashboardView';
import {AdminService} from '../../../core/admin/AdminService';
import {FormatEnumPipe} from '../../../shared/format-enum-pipe';

@Component({
  selector: 'app-admin-main',
  imports: [
    ButtonSmall,
    NoteSection,
    RouterLink,
    AsyncPipe,
    DecimalPipe,
    FormatEnumPipe,
    LowerCasePipe,
    UpperCasePipe
  ],
  templateUrl: './admin-main.html',
})
export class AdminMain implements OnInit{
  private basePath!: string;
  sales!: Observable<AdminDashboardView>
  constructor(public userState: UserStateService,private adminService: AdminService,
              private router: Router) {
    this.userState._basePath.subscribe({
        next: (path) => {
          this.basePath = path;
        }
      }
    )
  }

  ngOnInit(): void {
    this.sales = this.adminService.getAdminDashboardInfo();
  }

  onSaleDetails(saleId: string){
    this.router.navigate([this.basePath,'sales'], { state: { preselectedSaleId: saleId } });
  }




}
