import { Component } from '@angular/core';
import {ClientMaster} from '../../layout/client-master/client-master';
import {ButtonSmall} from '../../shared/button-small/button-small';

@Component({
  selector: 'app-price-list',
  imports: [
    ClientMaster,
    ButtonSmall
  ],
  templateUrl: './price-list.html',
})
export class PriceList {
  editPriceListMode = false;

  onEditList(){
    this.editPriceListMode = true
  }
  onSaveList(){
    //   persist operation
    this.editPriceListMode = false;
  }
  onCancelList(){
    // Cancellation of sale mod
    this.editPriceListMode = false;
  }

}
