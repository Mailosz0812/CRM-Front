import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ButtonSmall} from '../../../shared/button-small/button-small';
import {ListItem} from '../../../core/pricelist/models/price-list-response';
import {AsyncPipe, DecimalPipe, LowerCasePipe} from '@angular/common';
import {FormatEnumPipe} from '../../../shared/format-enum-pipe';
import {SaleItem} from '../../../core/sale/models/SaleCreationReq';
import {BehaviorSubject} from 'rxjs';
import {PRODUCT_UNITS} from '../../../core/pricelist/models/unit.model';
export interface CartEntry{
  item: ListItem,
  saleItem: SaleItem
}

@Component({
  selector: 'app-price-list-modal',
  imports: [
    ButtonSmall,
    DecimalPipe,
    FormatEnumPipe,
    LowerCasePipe,
    AsyncPipe
  ],
  templateUrl: './price-list-modal.html',
})

export class PriceListModal implements OnInit{
  // @Input({
  //   required:true
  // })
  // clientId!: string

  @Input() chosenItemsInput!: CartEntry[];
  isStagingExpanded = false;

  @Output() chooseProducts = new EventEmitter<CartEntry[]>();
  @Output() close = new EventEmitter<boolean>();

  notification: { show: boolean; type: 'success' | 'error'; message: string } = {
    show: false,
    type: 'success',
    message: ''
  };

  individualItems: ListItem[] = [

  ]
  items: ListItem[] = []

  private _prodSubject = new BehaviorSubject<ListItem[]>([]);

  prodMap = new Map<string,boolean>();
  chosenProdMap = new Map<string,CartEntry>();


  priceListMode: 'base' | 'individual' = 'base';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {

    this.items.forEach(item => {
      this.prodMap.set(item.id!,false);
    })
    this.individualItems.forEach(item => {
      this.prodMap.set(item.id!,false);
    })

    if(this.chosenItemsInput && this.chosenItemsInput.length > 0){
      this.chosenItemsInput.forEach(item => {
        this.chosenProdMap.set(item.saleItem.prodId,item);
        this.prodMap.set(item.saleItem.prodId, true);
      });
    }
    this._prodSubject.next(this.items);
  }
  onClose(){
    this.close.emit(true);
  }
  onChooseProduct(item: ListItem){
    if(this.prodMap.has(item.id!) && !this.prodMap.get(item.id!)) {
      this.prodMap.set(item.id!, !this.prodMap.get(item.id!))
      this.chosenProdMap.set(item.id!,{
        item: item,
        saleItem: {
          prodId: item.id!,
          amount: '',
          unitPrice: item.unitPrice
        }
      });
      this.cdr.detectChanges();
    }
  }
  onRemoveItem(prodId: string){
    if(this.chosenProdMap.has(prodId)){
      this.chosenProdMap.delete(prodId);
      this.prodMap.set(prodId,false);
    }
  }
  productSubject(){
    return this._prodSubject.asObservable();
  }

  updateItemField(prodId: string, field: keyof SaleItem, value: string) {
    const entry = this.chosenProdMap.get(prodId);
    if (!entry) return;

    const numValue = parseFloat(value);

    if (numValue < 0) {
      entry.saleItem[field] = '0';
    } else {
      entry.saleItem[field] = value;
    }
  }
  normalizeValue(id: string, field: keyof SaleItem) {
    const entry = this.chosenProdMap.get(id);
    if (entry) {
      const num = parseFloat(entry.saleItem[field]);
      entry.saleItem[field] = isNaN(num) ? '0' : num.toString();
    }
  }

  onSaveProducts(){
    if(this.chosenProdMap.size < 1){
      return
    }
    const chosenItems: CartEntry[] = [];
    let isValid = true;
    for (const value of this.chosenProdMap.values()) {
      const item = value.saleItem;
      const price = parseFloat(item.unitPrice);
      const amount = parseFloat(item.amount);
      if(!price || price < 0){
        this.showNotification('error', 'Cena w jednym z produktów jest nieprawidłowa! (Mniejsza od zera)');
        this.cdr.detectChanges();
        isValid = false;
        break;
      }
      if(!amount || amount <= 0){
        this.showNotification('error', 'Ilość w jednym z produktów jest nieprawidłowa! (Mniejsza bądź równa zero)');
        this.cdr.detectChanges();
        isValid = false;
        break;
      }
      chosenItems.push(value)
    }
    if(isValid) {
      this.showNotification('success','Pomyślnie zapisano produkty');
      this.chooseProducts.emit(chosenItems);
    }
  }

  onPriceListMode(mode: 'base' | 'individual'){
    this.priceListMode = mode;
    if(mode === 'base'){
      this._prodSubject.next(this.items)
    }else{
      this._prodSubject.next(this.individualItems)

    }
  }

  showNotification(type: 'success' | 'error', message: string) {
    this.notification = { show: true, type, message };

    setTimeout(() => {
      this.notification.show = false;
    }, 4000);
  }
  toggleStaging() {
    this.isStagingExpanded = !this.isStagingExpanded;
  }

  protected readonly parseFloat = parseFloat;
  protected readonly PRODUCT_UNITS = PRODUCT_UNITS;
}
