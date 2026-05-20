import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ClientMaster} from '../../layout/client-master/client-master';
import {ButtonSmall} from '../../shared/button-small/button-small';
import {UserStateService} from '../../core/user/user-state.service';
import {AsyncPipe, CurrencyPipe, DatePipe, LowerCasePipe, NgClass} from '@angular/common';
import {BehaviorSubject, combineLatest, map, Observable, tap} from 'rxjs';
import {RouterLink} from '@angular/router';
import {PriceListService} from '../../core/pricelist/PriceListService';
import {PriceListShort} from '../../core/pricelist/models/price-list-short';
import {ListItem} from '../../core/pricelist/models/price-list-response';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {PRODUCT_UNITS} from '../../core/pricelist/models/unit.model';
import {Category} from '../../core/pricelist/models/category';
import {ProductService} from '../../core/pricelist/ProductService';
import {BasePricelistModal} from './price-list-creation/base-pricelist-modal/base-pricelist-modal';
import {NotificationState} from '../../shared/notification/NotificationState';
import {PriceListUpdate} from '../../core/pricelist/models/price-list-update';
import {BaseItem} from '../../core/pricelist/models/PriceList';
import {Notification} from '../../shared/notification/notification';

@Component({
  selector: 'app-price-list',
  imports: [
    ClientMaster,
    ButtonSmall,
    AsyncPipe,
    RouterLink,
    NgClass,
    DatePipe,
    CurrencyPipe,
    ReactiveFormsModule,
    LowerCasePipe,
    BasePricelistModal,
    Notification
  ],
  templateUrl: './price-list.html',
})
export class PriceList implements OnInit{
  protected productSubject = new BehaviorSubject<ListItem[]>([]);
  private productsBackup: ListItem[] = [];

  protected stagedBaseItems = new BehaviorSubject<ListItem[]>([]);

  notificationState: NotificationState = {
    show: false,
    message: '',
    type: 'success'
  };

  basePriceList: ListItem[] = [];

  editPriceListMode = false;
  addBaseMode = false;

  selectedId$ = new BehaviorSubject<string | null>(null);
  selectedListId: string | null = null;
  selectedPriceList!: Observable<PriceListShort[]>;
  producers$: Observable<string[]>
  categories = new Map<string, Category>;
  combinedProducts$: Observable<ListItem[]> = combineLatest([
    this.productSubject,
    this.stagedBaseItems
  ]).pipe(
    map(([existing, staged]) => [...existing, ...staged])
  );


  newItemForm!: FormGroup;

  preselectedClientId: string | null = null;

  constructor(public userState: UserStateService,private priceService: PriceListService,
              private fb: FormBuilder, private productService: ProductService,
              private cdr: ChangeDetectorRef) {
    this.newItemForm = this.fb.group({
        name: ['', Validators.required],
        internalName: ['', Validators.required],
        unitPrice: [null, [Validators.required, Validators.min(0)]],
        unit: [null, [Validators.required]],
        category: [null, [Validators.required]],
        tps: ['', Validators.required],
        pack: [''],
        producer: ['', Validators.required]
      }
    )

    this.producers$ = this.productService.getProducts();
    this.priceService.getBasePriceList().subscribe({
      next: (resp) => {
        this.basePriceList = resp.productList;
      },
      error: (err) => {
        this.triggerNotification('error','Wystąpił błąd podczas ładowania cennika bazowego')
      }
    });
  }

  ngOnInit(): void {
    this.preselectedClientId = history.state.preselectedClientId;

    this.productService.getCategories().subscribe({
      next: (resp) => {
        resp.forEach(cat => {
          this.categories.set(cat.name, cat);
        })

      }
    });
  }
  onAddItem(){
    if(this.newItemForm.valid){
      const { name, unitPrice, unit,category, internalName, pack, tps, producer } = this.newItemForm.value;
      const tpsIsoString = new Date(tps).toISOString();
      const listItem: ListItem = {
        id: null,
        internal: internalName,
        name: name,
        unitPrice: unitPrice,
        category: category,
        unit: unit,
        producer: producer,
        tps: tpsIsoString,
        pack: pack
      }
      const currentList = this.productSubject.getValue();
      this.productSubject.next([listItem ,...currentList]);
      this.newItemForm.reset();
    }
  }

  onSaveModalItems(items: ListItem[]) {
    this.stagedBaseItems.next(items);
  }

  onPrintPriceList(){
    if(this.selectedListId == ''){
      return;
    }
    this.priceService.getPriceListPrint(this.selectedListId!).subscribe({
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
  onEditList(){
    this.editPriceListMode = true;

    const currentProducts = this.productSubject.getValue();
    this.productsBackup = structuredClone(currentProducts);
  }
  onSaveList() {
    const existingProducts = this.productSubject.getValue();
    const stagedItems = this.stagedBaseItems.getValue();

    existingProducts.forEach(prod => {
      if(this.categories.has(prod.category)) {
        prod.category = this.categories.get(prod.category)!.id;
      }
    })

    const baseItemsToAdd: BaseItem[] = stagedItems.map(item => {
      return {
        prodId: item.id!,
        unitPrice: item.unitPrice,
        unit: item.unit,
        tps: item.tps
      }
    });
    const payload: PriceListUpdate = {
      listId: this.selectedListId!,
      products: existingProducts,
      baseItems: baseItemsToAdd
    };

    this.priceService.updateListItems(payload).subscribe({
      next: (resp) => {
        console.log(resp);
        this.editPriceListMode = false;
        this.productSubject.next(resp.productsList);
        this.stagedBaseItems.next([]);

        this.triggerNotification('success', 'Cennik został pomyślnie zaktualizowany!');
      },
      error: (err: Error) => {
        console.error(err);
        this.triggerNotification('error', 'Wystąpił błąd podczas aktualizacji cennika.');
      }
    });
  }
  onCancelList(){
    this.editPriceListMode = false;
    this.productSubject.next(this.productsBackup);
    this.productsBackup = [];
    this.stagedBaseItems.next([]);
  }
  selectClient(id: string){
    this.selectedId$.next(id);

    this.selectedListId = null;
    this.productSubject.next([])
    this.stagedBaseItems.next([]);

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
             this.priceService.getListItemsByListId(this.selectedListId).subscribe({
               next: (val) => {
                 this.productSubject.next(val);
               }
               }
             )
           }else {
             this.selectedListId = null;
             this.productSubject.next([])
           }
         })
       );
  }
  onSelectList(id: string){
    this.selectedListId = id;
    this.productSubject.next([]);
    this.stagedBaseItems.next([]);
    this.priceService.getListItemsByListId(id).subscribe({
      next: (items) => {
        this.productSubject.next(items);
      }
      }
    )
  }

  onOpenModal(){
    this.addBaseMode = true;
  }
  onCloseModal(flag: boolean){
    this.addBaseMode = false;
  }
  onRemoveItem(listItem: ListItem) {
    const staged = this.stagedBaseItems.getValue();
    const isStaged = staged.some(item => item.id === listItem.id);

    if (isStaged) {
      this.stagedBaseItems.next(staged.filter(item => item.id !== listItem.id));
    } else {
      const currentList = this.productSubject.getValue();
      this.productSubject.next(currentList.filter(item => item.id !== listItem.id));
    }
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

  protected readonly availableUnits = PRODUCT_UNITS;
}
