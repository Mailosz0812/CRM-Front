import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ButtonSmall} from '../../../shared/button-small/button-small';
import {AsyncPipe, DatePipe, DecimalPipe, LowerCasePipe} from '@angular/common';
import {PRODUCT_UNITS} from '../../../core/pricelist/models/unit.model';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ListItem} from '../../../core/pricelist/models/price-list-response';
import {FormatEnumPipe} from '../../../shared/format-enum-pipe';
import {BasePriceList, BasePriceListResponse, ProductOperation} from '../../../core/pricelist/models/BasePrice-list';
import {PriceListService} from '../../../core/pricelist/PriceListService';
import {BehaviorSubject, combineLatest, map, Observable} from 'rxjs';
import {Notification} from '../../../shared/notification/notification';
import {NotificationState} from '../../../shared/notification/NotificationState';
import {ProductService} from '../../../core/pricelist/ProductService';
import {ProductsFilter} from '../../../shared/products-filter/products-filter';
import {Category} from '../../../core/pricelist/models/category';
export interface ListItemOperation {
  isDeleted: boolean,
  item: ListItem
}
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
    Notification,
    ProductsFilter
  ],
  templateUrl: './base-pricelist.html',
})

export class BasePricelist implements OnInit{

  private apiItems = new BehaviorSubject<BasePriceListResponse>({
    productList: [],
    id: ''
  });
  private localChanges = new BehaviorSubject<Map<string, ListItemOperation>>(new Map());
  notificationState: NotificationState = {
    show: false,
    message: '',
    type: 'success'
  };
  private productsView = new BehaviorSubject<ListItem[]>([]);


  products$: Observable<ListItem[]> = combineLatest([
    this.apiItems,
    this.localChanges,
  ]).pipe(
    map(([base, changes]) => {
      let combined = base.productList
        .filter(item => !changes.get(item.id!)?.isDeleted)
        .map(item =>
          changes.has(item.id!) ? changes.get(item.id!)!.item : item
        );

      const newItems = Array.from(changes.values())
        .filter(op => op.item.id?.startsWith('new-') && !op.isDeleted)
        .map(op => op.item);

      return [...newItems, ...combined];
    })
  );
  producers$ = new BehaviorSubject<Set<string>>(new Set());
  categories = new Map<string, Category>();

  form!: FormGroup;
  onEditMode = false;

  availableUnits = PRODUCT_UNITS;


  constructor(private fb: FormBuilder, private priceService: PriceListService,
              private cdr: ChangeDetectorRef, private productService: ProductService,
              private priceListService: PriceListService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      internal: ['', Validators.required],
      unitPrice: [null, [Validators.required,Validators.min(0)]],
      unit: [null,Validators.required],
      tps: ['',Validators.required],
      pack: [''],
      producer: [null,Validators.required],
      category: [null,Validators.required]
    });

    this.priceService.getBasePriceList().subscribe({
      next: (resp) =>{
        console.log(resp);
        this.apiItems.next(resp)
      },error: (err) =>{
        this.triggerNotification('error',
          'Wystąpił błąd podczas ładowania cennika')
      }
    })
    this.productService.getProducts().subscribe({
      next: (resp) =>{
        this.producers$.next(new Set([...resp]));
      }
    })
    this.productService.getCategories().subscribe({
      next: (resp) => {
        resp.forEach(item => {
          this.categories.set(item.name,item);
        })
      },
      error: (err) => {
        this.triggerNotification('error','Wystąpił błąd podczas ładowania kategorii')
      }
      }
    );
  }

  onAddItem() {
    if (this.form.invalid) return;

    const value = this.form.value;
    const tempId = 'new-' + new Date().getTime();
    const item: ListItem = {
      ...value,
      tps: new Date(value.tps).toISOString(),
      id: tempId,
    };

    const currChanges = this.localChanges.value;
    currChanges.set(tempId, { isDeleted: false, item: item });
    this.localChanges.next(new Map(currChanges));

    this.form.reset();
  }

  onDeleteItem(item: ListItem) {
    const currChanges = this.localChanges.getValue();

    if (item.id?.toString().startsWith('new-')) {
      currChanges.delete(item.id!);
    } else {
      currChanges.set(item.id!, { item, isDeleted: true });
    }

    this.localChanges.next(new Map(currChanges));
  }

  onSaveItems() {
    const changes = this.localChanges.value;
    if (changes.size < 1) return;

    const productList: ProductOperation[] = Array.from(changes.values())
      .map(op => {
        const item = op.item;
        const categoryId = this.categories.has(item.category)
          ? this.categories.get(item.category)!.id
          : item.category;

        return {
          delete: op.isDeleted,
          prodReq: {
            ...item,
            id: item.id?.startsWith('new-') ? null : item.id,
            category: categoryId
          }
        };
      });

    const req: BasePriceList = { productList };

    this.priceService.patchBasePriceList(req).subscribe({
      next: (resp) => {
        this.apiItems.next(resp);
        this.localChanges.next(new Map());
        this.triggerNotification('success', 'Cennik zapisany pomyślnie');
      },
      error: (err) => this.triggerNotification('error', err.message)
    });
  }
  onEditItem(item: ListItem){
    const formattedDate = item.tps ? new Date(item.tps).toISOString().split('T')[0] : '';
    this.onEditMode = true;
    this.form.patchValue({
      ...item,
      tps: formattedDate,
    });

  }
  products(){
    return this.productsView.asObservable();
  }
  onFiltered(products: ListItem[]){
    this.productsView.next(products);
  }
  onSaveEditedItem() {
    if (this.form.invalid) return;

    const value = this.form.value;
    const item: ListItem = {
      ...value,
      tps: new Date(value.tps).toISOString()
    };

    const currMap = this.localChanges.getValue();
    currMap.set(value.id, { isDeleted: false, item: item });
    this.localChanges.next(new Map(currMap));

    this.form.reset();
    this.onEditMode = false;
  }
  onPrintPriceList(){
    const id = this.apiItems.value.id;
    if(id == ''){
      return;
    }
    this.priceListService.getPriceListPrint(id).subscribe({
      next: (resp) => {
        const pdfBlob = new Blob([resp], { type: 'application/pdf' });
        const fileUrl = URL.createObjectURL(pdfBlob);

        window.open(fileUrl,'_blank');
        setTimeout(() => {
          URL.revokeObjectURL(fileUrl);
        }, 1000);
      },
      error: (err) => {
        console.log(err);
        this.triggerNotification('error','Wystąpił błąd podczas generowania wydruku');
      }
    });
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

  protected readonly Array = Array;
}
