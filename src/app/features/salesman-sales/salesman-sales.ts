import { Component } from '@angular/core';
import {ButtonSmall} from '../../shared/button-small/button-small';
import {FilterPill} from '../../shared/fitler-pill/filter-pill.component';

@Component({
  selector: 'app-salesman-sales',
  imports: [
    ButtonSmall,
    FilterPill
  ],
  templateUrl: './salesman-sales.html',
})
export class SalesmanSales {
  isSidebarOpen = false;
  editSaleMode:boolean = false;

  onEditSale(){
    this.editSaleMode = true
  }
  onSaveSale(){
  //   persist operation
    this.editSaleMode = false;
  }
  onCancelSale(){
    // Cancellation of sale mod
    this.editSaleMode = false;
  }

}
