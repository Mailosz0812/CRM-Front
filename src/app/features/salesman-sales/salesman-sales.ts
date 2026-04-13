import {Component, OnInit} from '@angular/core';
import {ButtonSmall} from '../../shared/button-small/button-small';
import {FilterPill} from '../../shared/fitler-pill/filter-pill.component';
import {RouterLink} from '@angular/router';
import {SaleService} from '../../core/sale/SaleService';
import {BehaviorSubject, Observable, map, switchMap, tap} from 'rxjs';
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

@Component({
  selector: 'app-salesman-sales',
  imports: [
    ButtonSmall, FilterPill, RouterLink, AsyncPipe,
    LowerCasePipe, DecimalPipe, DatePipe, ReactiveFormsModule,
    FormsModule, FormatEnumPipe
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

  private currentSaleId!: string;
  targetDate: string | null = null;

  isSidebarOpen = false;
  editSaleMode: boolean = false;
  isDateModalOpen = false;
  cancelModalOpened = false;
  addMode: 'list' | 'scratch' = 'list';

  selectedSale = new BehaviorSubject<SaleCreationResp | null>(null);
  latestPrices!: Observable<ListItem[]>;
  cachedPrices: ListItem[] = [];
  selectedProduct: ListItem | null = null;

  itemForm!: FormGroup;
  scratchItemForm: FormGroup;
  saleInfo: FormGroup;

  notification: { show: boolean; type: 'success' | 'error'; message: string } = {
    show: false, type: 'success', message: ''
  };
  protected readonly availableUnits = PRODUCT_UNITS;

  constructor(private saleService: SaleService, private fb: FormBuilder, private priceService: PriceListService) {
    this.itemForm = this.fb.group({
      prodId: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]]
    });
    this.scratchItemForm = this.fb.group({
      name: ['', Validators.required],
      internal: ['', Validators.required],
      unitPrice: [null, Validators.required],
      unit: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]]
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

    this.itemForm.get('prodId')!.valueChanges.subscribe(selectedId => {
      this.selectedProduct = selectedId ? (this.cachedPrices.find(p => p.id === selectedId) || null) : null;
    });
  }

  onSelectSale(saleId: string) {
    this.saleService.getSaleDetails(saleId).pipe(
      tap(value => {
        this.latestPrices = this.priceService.getLatestItemsByClientId(value.clientId).pipe(
          tap(prices => {
            this.cachedPrices = prices;
            this.itemForm.reset();
          })
        );
        const items: SaleItemView[] = value.saleItems.map(item => ({
          prodId: item.prodId,
          name: item.name,
          internal: item.internal,
          unitPrice: item.unitPrice,
          unit: item.unit,
          amount: item.amount,
          sum: +item.sumPrice
        }));

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

  onAddItem() {
    if (this.itemForm.valid && this.selectedProduct) {
      const { prodId, amount } = this.itemForm.value;
      const saleViewItem: SaleItemView = {
        prodId,
        name: this.selectedProduct.name,
        internal: this.selectedProduct.internal,
        unitPrice: this.selectedProduct.unitPrice,
        unit: this.selectedProduct.unit,
        amount,
        sum: +amount * +this.selectedProduct.unitPrice
      };

      this.itemsState.next([...this.itemsState.getValue(), saleViewItem]);
      this.itemForm.reset();
    }
  }

  onAddScratchItem() {
    if (this.scratchItemForm.valid) {
      const { name, internal, unitPrice, unit, amount } = this.scratchItemForm.value;
      const saleViewItem: SaleItemView = {
        prodId: null,
        name, internal, unitPrice, unit, amount,
        sum: +amount * +unitPrice
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
  }

  onEditSale() {
    this.editSaleMode = true;
  }

  onSaveSale() {
    if (this.saleInfo.valid) {
      const currentItems = this.itemsState.getValue();

      const mappedSaleItems: SaleItem[] = currentItems
        .filter(i => i.prodId !== null)
        .map(i => ({ prodId: i.prodId!, amount: i.amount }));

      const mappedCustomItems: SaleScratchItem[] = currentItems
        .filter(i => i.prodId === null)
        .map(i => ({ name: i.name, internal: i.internal, unitPrice: i.unitPrice, unit: i.unit, amount: i.amount }));

      const saleUpdate: SaleUpdateReq = {
        saleId: this.currentSaleId,
        saleName: this.saleInfo.value.saleName,
        saleItems: mappedSaleItems,
        customItems: mappedCustomItems
      };

      this.saleService.updateSale(saleUpdate).subscribe({
        next: (val) => {
          this.selectedSale.next(val);
          this.showNotification('success', 'Zamówienie zostało zaktualizowane!');
          this.itemsSnapshot = [...this.itemsState.getValue()];
          this.editSaleMode = false;
          this._refreshSales.next();
        },
        error: (err: Error) => this.showNotification('error', err.message)
      });
    }
  }

  onCancelSale() {
    this.editSaleMode = false;
    this.itemsState.next([...this.itemsSnapshot]);
    this.saleInfo.patchValue({ saleName: this.selectedSale.getValue()?.saleName });
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
        this.showNotification('success', 'Zamówienie zmieniło status');
        this._refreshSales.next();
      },
      error: (err: Error) => this.showNotification('error', err.message)
    });
  }

  showNotification(type: 'success' | 'error', message: string) {
    this.notification = { show: true, type, message };
    setTimeout(() => { this.notification.show = false; }, 4000);
  }
}
