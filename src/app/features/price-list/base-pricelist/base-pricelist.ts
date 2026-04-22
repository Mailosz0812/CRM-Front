import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ButtonSmall} from '../../../shared/button-small/button-small';
import {AsyncPipe, DatePipe, DecimalPipe, LowerCasePipe} from '@angular/common';
import {PRODUCT_UNITS} from '../../../core/pricelist/models/unit.model';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ListItem} from '../../../core/pricelist/models/price-list-response';
import {FormatEnumPipe} from '../../../shared/format-enum-pipe';
import {BasePriceList, BasePriceListResponse} from '../../../core/pricelist/models/BasePrice-list';
import {PriceListService} from '../../../core/pricelist/PriceListService';
import {BehaviorSubject, combineLatest, EMPTY, map, Observable} from 'rxjs';
import {Notification} from '../../../shared/notification/notification';
import {NotificationState} from '../../../shared/notification/NotificationState';

@Component({
  selector: 'app-base-pricelist',
  imports: [
    ButtonSmall,
    LowerCasePipe,
    DecimalPipe,
    DatePipe,
    ReactiveFormsModule,
    FormatEnumPipe,
    AsyncPipe,
    Notification
  ],
  templateUrl: './base-pricelist.html',
})
export class BasePricelist implements OnInit{

  private apiItems = new BehaviorSubject<BasePriceListResponse>({
    productList: []
  });
  private localChanges = new BehaviorSubject<Map<string,ListItem>>(new Map<string, ListItem>())
  notificationState: NotificationState = {
    show: false,
    message: '',
    type: 'success'
  };


  products$:Observable<ListItem[]> = combineLatest([this.apiItems,this.localChanges]).pipe(
    map(([base, changes]) => {
      const updatedItems = base.productList.map( item => {
        return changes.has(item.id!) ? {...item, ...changes.get(item.id!)} : item;
      });

      const newItems = Array.from(changes.values()).filter(c => c.id?.toString().startsWith('new-'));

      return [... updatedItems, ... newItems]
    })
  )
  form!: FormGroup;
  onEditMode = false;

  availableUnits = PRODUCT_UNITS;

  constructor(private fb: FormBuilder, private priceService: PriceListService,
              private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      internal: ['', Validators.required],
      unitPrice: [null, [Validators.required,Validators.min(0)]],
      unit: [null,Validators.required],
      tps: ['',Validators.required],
      pack: [''],
      producer: [null,Validators.required]
    });

    this.priceService.getBasePriceList().subscribe({
      next: (resp) =>{
        this.apiItems.next(resp)
      },error: (err) =>{
        this.triggerNotification('error',
          'Wystąpił błąd podczas ładowania cennika')
      }
    })
  }

  onAddItem(){
    if(this.form.invalid){
      return;
    }
    const value = this.form.value;
    const formatDate = new Date(value.tps).toISOString();
    const tempId = 'new-' + new Date();
    const item: ListItem = {
      ... value,
      tps: formatDate,
      id: tempId
    }

    const currItems = this.localChanges.value;
    currItems.set(tempId,item)
    this.localChanges.next(currItems);
    this.form.reset();
    this.cdr.detectChanges();
  }

  onSaveItems(){
    const products = this.localChanges.value;
    if(products.size < 1){
      return;
    }
    const productList = Array.from(products.values())
      .map(item => {
        if(item.id?.startsWith('new-')){
          return {
            ...item,
            id: null,
          }
        }
        return item;
      });
    const req: BasePriceList = {
      productList: productList
    }
    this.priceService.patchBasePriceList(req).subscribe({
      next: (resp) =>{
        this.apiItems.next(resp);
        this.localChanges.next(new Map());
        this.cdr.detectChanges();
        this.triggerNotification('success','Cennik zapisany pomyślnie')
      },
      error: (err) => {
        this.triggerNotification('error',err.message);
      }
    });
  }

  onEditItem(item: ListItem){
    const formattedDate = item.tps ? new Date(item.tps).toISOString().split('T')[0] : '';
    this.onEditMode = true;
    this.form.patchValue({
      ...item,
      tps: formattedDate
    });

  }

  onSaveEditedItem(){
    if(this.form.invalid){
      return;
    }

    const value = this.form.value;
    const tps = new Date(value.tps).toISOString();

    const item: ListItem = {
      ...value,
      tps: tps
    };

    const currMap = this.localChanges.getValue();
    currMap
      .set(value.id,item);
    this.localChanges.next(currMap);

    this.form.reset();
    this.onEditMode = false;
  }

  triggerNotification(type: 'success' | 'error', message: string) {
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
