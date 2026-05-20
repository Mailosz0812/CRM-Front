import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {PriceListService} from '../../../core/pricelist/PriceListService';
import {ClientService} from '../../../core/client/client.service';
import {filter, Observable, shareReplay, switchMap, tap} from 'rxjs';
import {ClientShortResp} from '../../../core/client/models/client-short-resp';
import {AsyncPipe, CurrencyPipe, DecimalPipe, LowerCasePipe} from '@angular/common';
import {ListItem} from '../../../core/pricelist/models/price-list-response';
import {PRODUCT_UNITS} from '../../../core/pricelist/models/unit.model';
import {SaleCreationReq, SaleItem, SaleScratchItem} from '../../../core/sale/models/SaleCreationReq';
import {SaleItemView} from '../../../core/sale/models/SaleItemView';
import {SaleService} from '../../../core/sale/SaleService';
import {CartEntry, PriceListModal} from '../price-list-modal/price-list-modal';
import {Notification} from '../../../shared/notification/notification';
import {NotificationState} from '../../../shared/notification/NotificationState';

@Component({
  selector: 'app-sales-creation-form',
  imports: [
    ReactiveFormsModule,
    AsyncPipe,
    CurrencyPipe,
    LowerCasePipe,
    DecimalPipe,
    PriceListModal,
    Notification
  ],
  templateUrl: './sales-creation-form.html',
})
export class SalesCreationForm implements OnInit{
  infoForm: FormGroup;
  newItemForm: FormGroup;
  newScratchItem: FormGroup;

  clientsList!: Observable<ClientShortResp[]>
  availableProducts!: Observable<ListItem[]>
  cachedProducts: ListItem[] = [];
  selectedProduct: ListItem | null = null;
  grossPrice: number = 0.0;

  addMode: 'modal' | 'scratch' = 'scratch';

  chosenItems: CartEntry[] = [];
  sum: number = 0;

  saleViewItems: SaleItemView[] = [];

  notificationState: NotificationState = {
    show: false,
    message: '',
    type: 'success'
  };

  readonly availableUnits = PRODUCT_UNITS;
  constructor(private fb: FormBuilder,private priceService: PriceListService,
              private clientService: ClientService,private saleService: SaleService,
              private cdr: ChangeDetectorRef) {
    this.infoForm = fb.group({
      saleName: ['',Validators.required],
      clientId: ['', Validators.required],
      note: [''],
      warehouseNote: ['']
    });

    this.newItemForm = fb.group({
      productId: ['', Validators.required],
      amount: [null,[Validators.required,Validators.min(0.01)]],
    });

    this.newScratchItem = fb.group({
      name: ['',Validators.required],
      internal: ['', Validators.required],
      unitPrice: [null,Validators.required],
      unit: [null,Validators.required],
      amount: [null,[Validators.required,Validators.min(0.01)]]
    })

    this.clientsList = this.clientService.getClientsList();
    this.availableProducts = this.infoForm.get('clientId')!.valueChanges.pipe(
      filter(clientId => !!clientId),
      switchMap(clientId => {
        return this.priceService.getLatestItemsByClientId(clientId);
      }),
      tap(products => {
        this.cachedProducts = products;

        this.newItemForm.reset();
        this.newScratchItem.reset();
      }),
      shareReplay(1)
    );
  }
  ngOnInit() {
    this.newItemForm.get('productId')!.valueChanges.subscribe(selectedId => {
      if (selectedId) {
        this.selectedProduct = this.cachedProducts.find(p => p.id === selectedId) || null;
      } else {
        this.selectedProduct = null;
      }
    });
    this.newItemForm.get('amount')!.valueChanges.subscribe(amount => {
      if(this.selectedProduct && amount) {
        const parsedAmount = Number(amount);
        const parsedPrice = Number(this.selectedProduct.unitPrice);

        this.grossPrice = parsedAmount * parsedPrice;
      } else {
        this.grossPrice = 0.0;
      }
    })
  }
  onAddScratch(){
    if(this.newScratchItem.invalid){
      return;
    }
    const {name, unitPrice, unit, amount, internal} = this.newScratchItem.value

    const parsedAmount = Number(amount);
    const parsedPrice = Number(unitPrice);

    const sum1 = parsedAmount * parsedPrice;
    const itemView: SaleItemView = {
      prodId: null,
      name: name,
      internal: internal,
      unit: unit,
      unitPrice: unitPrice,
      amount: amount,
      sum: sum1
    };

    this.saleViewItems.push(itemView);
    this.sum+=sum1;
    this.newScratchItem.reset();
  }
  onChooseProducts(items: CartEntry[]){
    this.chosenItems = items;
    const scratchItems = this.getScratchItems();
    this.saleViewItems = []
    let itemsSum = 0;

    const modalItems: SaleItemView[] = items.map(entry => {
      const sum1 = +entry.saleItem.amount * +entry.saleItem.unitPrice;
      itemsSum+=sum1
      return ({
          prodId: entry.saleItem.prodId,
          name: entry.item.name,
          internal: entry.item.internal,
          unit: entry.item.unit,
          unitPrice: entry.saleItem.unitPrice,
          amount: entry.saleItem.amount,
          sum: sum1
        });
    });
    this.sum = itemsSum;
    this.saleViewItems = [...modalItems, ... scratchItems];
  }



  onDeleteItem(item: SaleItemView,idx: number){
    if (item.prodId) {
      this.chosenItems = this.chosenItems.filter(
        (entry) => entry.saleItem.prodId !== item.prodId
      );
    }
    this.sum-=item.sum;
    this.saleViewItems.splice(idx,1);
  }

  get scratchGrossPrice(): number {
    const amount = Number(this.newScratchItem.get('amount')?.value) || 0;
    const price = Number(this.newScratchItem.get('unitPrice')?.value) || 0
    return amount >= 0 && price >= 0 ? amount * price : 0;
  }

  onCreateSale(){
    if (this.infoForm.invalid || this.saleViewItems.length === 0) {
      this.triggerNotification('error', 'Formularz jest niekompletny lub brak pozycji.');
      return;
    }
    const {saleName, clientId, note, warehouseNote } = this.infoForm.value;

    const saleItems: SaleItem[] = this.saleViewItems
      .filter((item) => !!item.prodId)
      .map(item => ({
        prodId: item.prodId!,
        amount: item.amount,
        unitPrice: item.unitPrice
      }));
    const customItems: SaleScratchItem[] = this.getScratchItems().map(item => ({
      name: item.name,
      internal: item.internal,
      unitPrice: item.unitPrice,
      unit: item.unit,
      amount: item.amount
    }));

    const saleCreationReq: SaleCreationReq = {
      saleName: saleName,
      clientId: clientId,
      saleData: note,
      warehouseNote: warehouseNote,
      saleItems: saleItems,
      customItems: customItems,
    }
    this.saleService.createSale(saleCreationReq).subscribe({
      next: (resp) => {
        this.newItemForm.reset();
        this.newScratchItem.reset();
        this.infoForm.reset();
        this.saleViewItems = [];
        this.triggerNotification('success', 'Zamówienie zostało utworzone pomyślnie!');
      },
      error: (err: Error) => {
        this.triggerNotification('error', err.message);
      }
    })
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
  private getScratchItems() {
    return this.saleViewItems.filter((item) => !item.prodId);
  }
}

