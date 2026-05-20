import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ButtonSmall} from '../../../shared/button-small/button-small';
import {ListItem} from '../../../core/pricelist/models/price-list-response';
import {AsyncPipe, DatePipe, DecimalPipe, LowerCasePipe} from '@angular/common';
import {FormatEnumPipe} from '../../../shared/format-enum-pipe';
import {SaleItem} from '../../../core/sale/models/SaleCreationReq';
import {BehaviorSubject, Observable, combineLatest, map} from 'rxjs';
import {PRODUCT_UNITS} from '../../../core/pricelist/models/unit.model';
import {FormsModule} from '@angular/forms';
import {ProductService} from '../../../core/pricelist/ProductService';
import {ProductsFilter} from '../../../shared/products-filter/products-filter';
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
    AsyncPipe,
    DatePipe,
    FormsModule,
    ProductsFilter
  ],
  templateUrl: './price-list-modal.html',
})

export class PriceListModal implements OnInit{

  @Input() chosenItemsInput!: CartEntry[];
  @Input()
  individualItems!: ListItem[];
  @Input({
    required: true
  })
  items!: ListItem[];

  @Output() chooseProducts = new EventEmitter<CartEntry[]>();
  @Output() close = new EventEmitter<boolean>();

  notification: { show: boolean; type: 'success' | 'error'; message: string } = {
    show: false,
    type: 'success',
    message: ''
  };
  isStagingExpanded= false;
  priceListMode: 'base' | 'individual' = 'base';

  private _prodSubject = new BehaviorSubject<ListItem[]>([]);
  private _dataSource = new BehaviorSubject<ListItem[]>([]);
  prodMap = new Map<string,boolean>();
  chosenProdMap = new Map<string,CartEntry>();

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
    this._dataSource.next(this.items);
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
          unitPrice: item.unitPrice,
          unit: item.unit,
          tps: item.tps,
          pack: item.pack
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

  dataSource() {
    return this._dataSource.asObservable();
  }
  products(){
    return this._prodSubject.asObservable();
  }

  onFiltered(items: ListItem[]){
    this._prodSubject.next(items);
  }
  updateItemField(prodId: string, field: keyof SaleItem, value: any) {
    const entry = this.chosenProdMap.get(prodId);
    if (!entry) return;

    const numericFields: (keyof SaleItem)[] = ['unitPrice', 'amount'];

    if (numericFields.includes(field)) {
      const numValue = parseFloat(value);
      entry.saleItem[field] = numValue < 0 ? '0' : value.toString();
    } else if (field === 'unit') {
      entry.saleItem.unit = value;
    }
  }
  normalizeValue(id: string, field: keyof SaleItem) {
    const entry = this.chosenProdMap.get(id);
    if (!entry) return;

    const numericFields: (keyof SaleItem)[] = ['unitPrice', 'amount'];

    if (numericFields.includes(field)) {
      const numericField = field as 'unitPrice' | 'amount';

      const currentValue = entry.saleItem[numericField];
      const num = parseFloat(currentValue);

      entry.saleItem[numericField] = isNaN(num) ? '0' : num.toString();
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
    const targetItems = mode === 'base' ? this.items : this.individualItems;
    this._dataSource.next(targetItems);
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


  protected readonly PRODUCT_UNITS = PRODUCT_UNITS;
}
