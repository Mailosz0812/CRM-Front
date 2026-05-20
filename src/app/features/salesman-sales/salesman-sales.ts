import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ButtonSmall} from '../../shared/button-small/button-small';
import {FilterPill} from '../../shared/fitler-pill/filter-pill.component';
import {RouterLink} from '@angular/router';
import {SaleService} from '../../core/sale/SaleService';
import {BehaviorSubject, Observable, map, switchMap, tap, combineLatest} from 'rxjs';
import {ShortSaleResp} from '../../core/client/models/client-dashboard-info';
import {AsyncPipe, DatePipe, DecimalPipe, LowerCasePipe} from '@angular/common';
import {SaleCreationResp} from '../../core/sale/models/SaleCreationResp';
import {PriceListService} from '../../core/pricelist/PriceListService';
import {ListItem} from '../../core/pricelist/models/price-list-response';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {SaleItemView} from '../../core/sale/models/SaleItemView';
import {PRODUCT_UNITS} from '../../core/pricelist/models/unit.model';
import {SaleItem, SaleScratchItem} from '../../core/sale/models/SaleCreationReq';
import {SaleStages} from '../../core/sale/models/Stage.model';
import {StageOperationReq} from '../../core/sale/models/StageOperationReq';
import {FormatEnumPipe} from '../../shared/format-enum-pipe';
import {SaleUpdateReq} from '../../core/sale/models/SaleUpdateReq';
import {Notification} from "../../shared/notification/notification";
import {NotificationState} from '../../shared/notification/NotificationState';
import {CartEntry, PriceListModal} from './price-list-modal/price-list-modal';
import {BasePriceListResponse} from '../../core/pricelist/models/BasePrice-list';
import {SalePrintHelper} from '../../core/sale/SalePrintHelper';

@Component({
  selector: 'app-salesman-sales',
  imports: [
    ButtonSmall, FilterPill, RouterLink, AsyncPipe,
    LowerCasePipe, DecimalPipe, DatePipe, ReactiveFormsModule,
    FormsModule, FormatEnumPipe, Notification, PriceListModal
  ],
  templateUrl: './salesman-sales.html',
})
export class SalesmanSales implements OnInit {

  private itemsState = new BehaviorSubject<SaleItemView[]>([]);
  _itemsState = this.itemsState.asObservable();
  private itemsSnapshot: SaleItemView[] = [];

  totalSum$: Observable<number> = this._itemsState.pipe(
    map(items => items.reduce((acc, curr) => acc + curr.sum, 0))
  );

  private _refreshSales = new BehaviorSubject<void>(undefined);
  sales!: Observable<ShortSaleResp[]>;

  searchTerm$ = new BehaviorSubject<string>('');
  stage$ = new BehaviorSubject<SaleStages | 'wszystkie'>('wszystkie')
  filteredSales!: Observable<ShortSaleResp[]>;


  private currentSaleId!: string;
  targetDate: string | null = null;

  isSidebarOpen = false;
  editSaleMode: boolean = false;
  isDateModalOpen = false;
  cancelModalOpened = false;
  addMode: 'list' | 'scratch' = 'list';
  notificationState: NotificationState = {
    show: false,
    message: '',
    type: 'success'
  };

  selectedSale = new BehaviorSubject<SaleCreationResp | null>(null);
  latestPrices!: ListItem[];
  chosenItems: CartEntry[] = [];
  private _basePrices = new Map<string,ListItem>();

  scratchItemForm: FormGroup;
  saleInfo: FormGroup;

  notification: { show: boolean; type: 'success' | 'error'; message: string } = {
    show: false, type: 'success', message: ''
  };
  protected readonly availableUnits = PRODUCT_UNITS;

  constructor(private saleService: SaleService, private fb: FormBuilder,
              private priceService: PriceListService, private cdr: ChangeDetectorRef,
              private salePrintHelper: SalePrintHelper) {
    this.scratchItemForm = this.fb.group({
      name: ['', Validators.required],
      internal: ['', Validators.required],
      unitPrice: [null, Validators.required],
      unit: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      tps: ['', Validators.required],
      pack: ['']
    });
    this.saleInfo = this.fb.group({
      saleName: ['', Validators.required]
    });

  }

  ngOnInit(): void {
    this.sales = this._refreshSales.pipe(
      switchMap(() => this.saleService.getAllSales()),
      tap(items => {
        const passedSaleId = history.state.preselectedSaleId;

        if (passedSaleId) {
          this.onSelectSale(passedSaleId);
        }
        else if (items.length > 0 && !this.currentSaleId) {
          this.onSelectSale(items[0].saleId);
        }
      })
    );
    this.priceService.getBasePriceList().subscribe({
      next: (basePriceList: BasePriceListResponse) => {
        basePriceList.productList.forEach(item => {
          this._basePrices.set(item.id!,item)
        });
      },
      error: (err) => {
        console.log(err);
        this.triggerNotification('error','Błąd podczas ładowania cennika bazowego.')
      }
    });

    this.filteredSales = combineLatest([this.sales, this.searchTerm$, this.stage$])
      .pipe(
        map(([sales,term,stage]) => {
          let list: ShortSaleResp[] = [...sales];
          if(term !== ''){
            list = list.filter(item =>
              item.saleName.toLowerCase().includes(term.toLowerCase()) || item.clientName.toLowerCase().includes(term.toLowerCase()));
          }

          if(stage !== 'wszystkie'){
            list = list.filter(item => item.stage === stage);
          }

          return list;
        })
      );
  }

  onSelectSale(saleId: string) {
    this.saleService.getSaleDetails(saleId).pipe(
      tap(value => {
        this.priceService.getLatestItemsByClientId(value.clientId).subscribe({
          next: (individualPrices) => {
            this.latestPrices = individualPrices.items
          }
        })
        const items: SaleItemView[] = value.saleItems.map(item => ({
          prodId: item.prodId,
          name: item.name,
          internal: item.internal,
          unitPrice: item.unitPrice,
          unit: item.unit,
          amount: item.amount,
          sum: +item.sumPrice,
          tps: item.tps,
          pack: item.pack
        }));

        this.chosenItems = value.saleItems.map(item => {
          const producer = !this._basePrices.get(item.prodId) ? '': this._basePrices.get(item.prodId)!.producer;
          return ({
            item: {
              id: item.prodId,
              name: item.name,
              internal: item.internal,
              unitPrice: item.unitPrice,
              unit: item.unit,
              producer: producer,
              tps: item.tps,
              pack: item.pack,
              category: ""
            },
            saleItem: {
              prodId: item.prodId,
              amount: item.amount,
              unitPrice: item.unitPrice,
              unit: item.unit,
              tps: item.tps,
              pack: item.pack
            }
          });
        });


        this.itemsState.next(items);
        this.itemsSnapshot = [...items];
        this.currentSaleId = value.saleId;
        this.saleInfo.patchValue({ saleName: value.saleName });
        this.editSaleMode = false;
      })
    ).subscribe({
      next: (val) => this.selectedSale.next(val)
    });
  }

  onChooseProducts(cartEntry: CartEntry[]){
    this.chosenItems = cartEntry;

    const scratchItems = this.itemsState.getValue().filter(item => !item.prodId);
    const mappedModalItems: SaleItemView[] = cartEntry.map(item => ({
      prodId: item.saleItem.prodId,
      name: item.item.name,
      internal: item.item.internal,
      unitPrice: item.saleItem.unitPrice,
      unit: item.saleItem.unit,
      amount: item.saleItem.amount,
      tps: item.item.tps,
      pack: item.item.pack,
      sum: +item.saleItem.unitPrice * +item.saleItem.amount
    }));
    this.itemsState.next([...mappedModalItems, ...scratchItems]);
  }
  onAddScratchItem() {
    if (this.scratchItemForm.valid) {
      const { name, internal, unitPrice, unit, amount,pack, tps } = this.scratchItemForm.value;
      const saleViewItem: SaleItemView = {
        prodId: null,
        name, internal, unitPrice, unit, amount,pack,tps,
        sum: +amount * +unitPrice,
      };

      this.itemsState.next([...this.itemsState.getValue(), saleViewItem]);
      this.scratchItemForm.reset();
    }
  }

  onDeleteItem(itemId: string | null, idx: number) {
    const currentItems = this.itemsState.getValue();
    const filtered = itemId
      ? currentItems.filter(p => p.prodId !== itemId)
      : currentItems.filter((_, index) => index !== idx);

    this.itemsState.next(filtered);
    if (itemId) {
      this.chosenItems = this.chosenItems.filter(entry => entry.saleItem.prodId !== itemId);
    }
  }

  onEditSale() {
    this.editSaleMode = true;
  }

  onSaveSale() {
    if (this.saleInfo.valid) {
      const currentItems = this.itemsState.getValue();

      const mappedSaleItems: SaleItem[] = currentItems
        .filter(i => i.prodId !== null)
        .map(i => ({
          prodId: i.prodId!,
          amount: i.amount ,
          unitPrice: i.unitPrice,
          unit: i.unit,
          tps: new Date(i.tps).toISOString(),
          pack: i.pack
        }));

      const mappedCustomItems: SaleScratchItem[] = currentItems
        .filter(i => i.prodId === null)
        .map(i => ({
          name: i.name,
          internal: i.internal,
          unitPrice: i.unitPrice,
          unit: i.unit,
          amount: i.amount,
          tps: new Date(i.tps).toISOString(),
          pack: i.pack
        }));

      const saleUpdate: SaleUpdateReq = {
        saleId: this.currentSaleId,
        saleName: this.saleInfo.value.saleName,
        saleItems: mappedSaleItems,
        customItems: mappedCustomItems
      };

      this.saleService.updateSale(saleUpdate).subscribe({
        next: (val) => {
          this.selectedSale.next(val);
          this.triggerNotification('success', 'Zamówienie zostało zaktualizowane!');
          this.itemsSnapshot = [...this.itemsState.getValue()];
          this.editSaleMode = false;
          this._refreshSales.next();
        },
        error: (err: Error) => this.triggerNotification('error', err.message)
      });
    }
  }

  onCancelSale() {
    this.editSaleMode = false;
    this.itemsState.next([...this.itemsSnapshot]);
    this.saleInfo.patchValue({ saleName: this.selectedSale.getValue()?.saleName });

    this.rebuildChosenItems(this.itemsSnapshot);
  }

  onPrintSale(saleId: string){
    this.saleService.getSalePrint(saleId).subscribe({
      next: (resp) => {
        this.salePrintHelper.onPrintSale(resp);
      }
    })
  }

  confirmOperation(status: SaleStages) {
    this.isDateModalOpen = false;
    this.cancelModalOpened = false;
    this.changeStatus(status);
  }

  changeStatus(status: SaleStages) {
    const stageReq: StageOperationReq = {
      stage: status,
      packageDate: (status === 'DO_REALIZACJI' && this.targetDate) ? new Date(this.targetDate).toISOString() : null,
      saleId: this.currentSaleId
    };

    this.saleService.changeSaleStage(stageReq).subscribe({
      next: (val) => {
        this.selectedSale.next(val);
        this.triggerNotification('success', 'Zamówienie zmieniło status');
        this._refreshSales.next();
      },
      error: (err: Error) => this.triggerNotification('error', err.message)
    });
  }

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm$.next(value);
  }

  onStageChange(stage: SaleStages | 'wszystkie'){
    this.stage$.next(stage);
  }

  get basePrices(): ListItem[] {
    return Array.from(this._basePrices.values())
  }

  private rebuildChosenItems(items: SaleItemView[]) {
    this.chosenItems = items
      .map(item => {
        const producer = !this._basePrices.get(item.prodId!) ? '': this._basePrices.get(item.prodId!)!.producer;
        return {
          item: {
            id: item.prodId!,
            name: item.name,
            internal: item.internal,
            unitPrice: item.unitPrice,
            unit: item.unit,
            producer: producer,
            tps: item.tps,
            pack: item.pack,
            category: ""
          },
          saleItem: {
            prodId: item.prodId!,
            amount: item.amount,
            unitPrice: item.unitPrice,
            unit: item.unit,
            tps: item.tps,
            pack: item.pack
          }
        };
      });
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
