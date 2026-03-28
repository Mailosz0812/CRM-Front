import {Component, OnInit} from '@angular/core';
import {ClientMaster} from '../../layout/client-master/client-master';
import {ButtonSmall} from '../../shared/button-small/button-small';
import {UserStateService} from '../../core/user/user-state.service';
import {AsyncPipe, CurrencyPipe, DatePipe, NgClass} from '@angular/common';
import {BehaviorSubject, map, Observable, of, take, tap} from 'rxjs';
import {RouterLink} from '@angular/router';
import {PriceListService} from '../../core/pricelist/PriceListService';
import {PriceListShort} from '../../core/pricelist/models/price-list-short';
import {ListItem} from '../../core/pricelist/models/price-list-response';

@Component({
  selector: 'app-price-list',
  imports: [
    ClientMaster,
    ButtonSmall,
    AsyncPipe,
    RouterLink,
    NgClass,
    DatePipe,
    CurrencyPipe
  ],
  templateUrl: './price-list.html',
})
export class PriceList{
  editPriceListMode = false;
  selectedId$ = new BehaviorSubject<string | null>(null);
  selectedListId: string | null = null;
  selectedPriceList!: Observable<PriceListShort[]>;
  selectedProducts!: Observable<ListItem[]>;
  constructor(public userState: UserStateService,private priceService: PriceListService) {}


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
  selectClient(id: string){
    this.selectedId$.next(id);

    this.selectedListId = null;
    this.selectedProducts = of([]);

     this.selectedPriceList = this.priceService.getPriceListByClientId(id)
       .pipe(
         map(list => {
           return [...list].sort((a, b) => {
             return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
           });
         }),
         tap(list => {
           if (list.length > 0){
             this.selectedListId = list[0].id;
             this.selectedProducts = this.priceService.getListItemsByListId(this.selectedListId)
           }else {
             this.selectedListId = null;
             this.selectedProducts = of([]);
           }
         })
       );
  }
  onSelectList(id: string){
    this.selectedListId = id;
    this.selectedProducts = this.priceService.getListItemsByListId(id);
  }

}
