import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ButtonSmall} from '../../../../shared/button-small/button-small';
import {AsyncPipe, DatePipe, DecimalPipe, LowerCasePipe} from '@angular/common';
import {ListItem} from '../../../../core/pricelist/models/price-list-response';
import {Notification} from '../../../../shared/notification/notification';
import {NotificationState} from '../../../../shared/notification/NotificationState';
import {ProductsFilter} from '../../../../shared/products-filter/products-filter';
import {BehaviorSubject} from 'rxjs';
import {List} from 'postcss/lib/list';

@Component({
  selector: 'app-base-pricelist-modal',
  imports: [
    ButtonSmall,
    DatePipe,
    DecimalPipe,
    LowerCasePipe,
    Notification,
    ProductsFilter,
    AsyncPipe
  ],
  templateUrl: './base-pricelist-modal.html',
})
export class BasePricelistModal implements OnInit{
  @Input({
    required: true
  }) basePriceList!: ListItem[];
  @Input() set preselectedItems(items: ListItem[]) {
    this.stagingItems.clear();
    if (items && items.length > 0) {
      items.forEach(item => {
        this.stagingItems.set(item.id!, { ...item });
      });
    }
  }

  @Output() closeEvent = new EventEmitter<boolean>();
  @Output() saveEvent = new EventEmitter<ListItem[]>();


  stagingItems = new Map<string,ListItem>();

  private _prodSubject = new BehaviorSubject<ListItem[]>([]);
  private _dataSource = new BehaviorSubject<ListItem[]>([]);

  stagingExpanded = false;

  notificationState: NotificationState = {
    show: false,
    message: '',
    type: 'success'
  };
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this._dataSource.next(this.basePriceList);
    this._prodSubject.next(this.basePriceList);
  }

  onClose(){
    this.closeEvent.emit(true);
  }
  onChooseItem(item: ListItem){
    const copyItem: ListItem = {...item};
    this.stagingItems.set(item.id!,copyItem);
  }
  onToggleStaging(){
    this.stagingExpanded = !this.stagingExpanded;
  }
  onRemoveItem(itemId: string){
    this.stagingItems.delete(itemId);
  }

  dataSource(){
    return this._dataSource.asObservable();
  }
  products(){
    return this._prodSubject.asObservable();
  }
  onFiltered(items: ListItem[]){
    this._prodSubject.next(items);
  }

  updateUnitPrice(itemId: string, value: HTMLInputElement){
    const item = this.stagingItems.get(itemId);
    if(!item){
      return;
    }
    const normalizedValue = parseFloat(value.value);
    if (isNaN(normalizedValue) || normalizedValue < 0) {

      value.value = item.unitPrice.toString();

      this.triggerNotification('error', 'Cena musi być większa od zera!');
      return;
    }
    item.unitPrice = normalizedValue.toString();
  }

  updateTps(itemId: string, value: HTMLInputElement){
    const item = this.stagingItems.get(itemId);
    if(!item){
      return;
    }
    const normalizedValue = new Date(value.value)
    const today = new Date();
    const limitValue = new Date();
    limitValue.setDate(today.getDate() - 7);
    limitValue.setHours(0, 0, 0, 0);


    if(normalizedValue < limitValue){
      const oldDate = new Date(item.tps);
      value.value = oldDate.toISOString().split('T')[0];
      this.triggerNotification('error', 'Data TPS nie może być starsza niż 7 dni!');
      return;
    }


    item.tps = normalizedValue.toISOString();
  }
  onSaveItems(){
    if(this.stagingItems.size < 1){
      return
    }
    this.saveEvent.emit(Array.from(this.stagingItems.values()));
    this.triggerNotification('success',"Pomyślnie zapisano produkty")
  }
  private triggerNotification(type: 'success' | 'error', message: string) {
    this.notificationState = {
      show: true,
      type: type,
      message: message
    };

    setTimeout(() => {
      this.notificationState.show = false;
      this.cdr.detectChanges();
    }, 5000);
  }

}
