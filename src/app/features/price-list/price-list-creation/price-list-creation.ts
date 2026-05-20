import {ChangeDetectorRef, Component, signal} from '@angular/core';
import {PriceListService} from '../../../core/pricelist/PriceListService';
import {ActivatedRoute, Router} from '@angular/router';
import {AsyncPipe, CurrencyPipe, LowerCasePipe} from '@angular/common';
import {ButtonSmall} from '../../../shared/button-small/button-small';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {PRODUCT_UNITS} from '../../../core/pricelist/models/unit.model';
import {BaseItem, PriceList} from '../../../core/pricelist/models/PriceList';
import {ProductService} from '../../../core/pricelist/ProductService';
import {BehaviorSubject, combineLatest, map, Observable, startWith} from 'rxjs';
import {Notification} from '../../../shared/notification/notification';
import {NotificationState} from '../../../shared/notification/NotificationState';
import {PriceListModal} from '../../salesman-sales/price-list-modal/price-list-modal';
import {BasePricelistModal} from './base-pricelist-modal/base-pricelist-modal';
import {Category} from '../../../core/pricelist/models/category';
import {ListItem} from '../../../core/pricelist/models/price-list-response';

@Component({
  selector: 'app-price-list-creation',
  imports: [
    AsyncPipe,
    ButtonSmall,
    FormsModule,
    ReactiveFormsModule,
    CurrencyPipe,
    LowerCasePipe,
    Notification,
    PriceListModal,
    BasePricelistModal
  ],
  templateUrl: './price-list-creation.html',
})
export class PriceListCreation{
  private clientId!: string | null;
  availableUnits = PRODUCT_UNITS;
  form: FormGroup;
  newItemForm: FormGroup;

  producers$ = new BehaviorSubject<string[]>([]);
  categories$: Observable<Category[]>;
  basePriceList: ListItem[] = [];
  chosenItems = new BehaviorSubject<ListItem[]>([]);
  notificationState: NotificationState = {
    show: false,
    message: '',
    type: 'success'
  };
  addBaseMode = false;

  constructor(private fb: FormBuilder,private priceService: PriceListService,
              private route: ActivatedRoute, private productService: ProductService,
              private cdr: ChangeDetectorRef
  ) {
    this.clientId = this.route.snapshot.paramMap.get('id');
    this.form = this.fb.group({
      listTitle: ['', Validators.required],
      items: this.fb.array([])
    });

    this.newItemForm = this.fb.group({
      name: ['', Validators.required],
      internal: ['',Validators.required],
      unitPrice: [null, [Validators.required, Validators.min(0)]],
      unit: [null, [Validators.required]],
      tps: ['', Validators.required],
      pack: [''],
      producer: ['', Validators.required],
      category: [null, Validators.required]
    });
    this.priceService.getBasePriceList().subscribe({
      next: (resp) => {
        this.basePriceList = resp.productList;
      },
      error: (err) => {
        this.triggerNotification('error','Wystąpił błąd podczas ładowania cennika bazowego')
      }
    });
    this.categories$ = this.productService.getCategories();
    this.productService.getProducts().subscribe({
      next: (producers) => {
        this.producers$.next(producers);
      },
      error: (err) => {
          this.triggerNotification('error','Wystąpił błąd podczas ładowania producentów');
      }
    })
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  get isListEmpty(): boolean {
    return this.chosenItems.value.length === 0 && this.items.length === 0;
  }

  addItem() {
    if (this.newItemForm.valid) {
      const { name, unitPrice, unit ,internal, tps, pack, producer,category} = this.newItemForm.value;
      const itemGroup = this.fb.group({
        name: [name, Validators.required],
        internalName: [internal, Validators.required],
        unitPrice: [unitPrice, Validators.required],
        unit: [unit,Validators.required],
        tps: [new Date(tps).toISOString(),Validators.required],
        pack: [pack],
        producer: [producer, Validators.required],
        categoryId: [category, Validators.required]
      });

      this.items.push(itemGroup);

      this.newItemForm.reset();
    }
  }

  onDeleteItem(itemToRemove: any) {
    if (itemToRemove.id) {
      this.chosenItems.next(this.chosenItems.value.filter(item => item.id !== itemToRemove.id));
    }
    else {
      const indexInForm = this.items.value.findIndex((val: any) => val.name === itemToRemove.name);
      if (indexInForm !== -1) {
        this.items.removeAt(indexInForm);
      }
    }
  }

  onSaveItems(items: ListItem[]){
    this.chosenItems.next(items);
  }

  combinedItems(){
    return combineLatest([
      this.chosenItems.asObservable(),
      this.items.valueChanges.pipe(startWith(this.items.value))
    ]).pipe(
      map(([chosen, custom]) => {
        return [...chosen, ...custom];
      })
    );
  }
  onSubmit() {
    if(this.form.invalid){
      return;
    }
    const baseItems: BaseItem[] = this.chosenItems.value.map(item => {
      return {
        prodId: item.id!,
        unitPrice: item.unitPrice,
        unit: item.unit,
        tps: item.tps
      }
    });
    const priceList: PriceList = {
      ...this.form.getRawValue(),
      clientId: this.clientId,
      baseItems: baseItems
    }
    this.priceService.createPriceList(priceList).subscribe({
      next: (resp)=> {
        this.form.reset();
        this.items.clear();
        this.chosenItems.next([]);
        this.triggerNotification('success','Cennik utworzony pomyślnie')
      },
      error: (err: Error) => {
        this.triggerNotification('error','Wystąpił błąd podczas zapisywania cennika')
      }
    });
  }
  onOpenModal(){
    this.addBaseMode = true;
  }
  onCloseModal(flag: boolean){
    this.addBaseMode = false;
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
