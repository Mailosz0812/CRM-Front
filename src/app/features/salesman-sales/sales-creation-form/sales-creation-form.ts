import {Component, OnInit} from '@angular/core';
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

@Component({
  selector: 'app-sales-creation-form',
  imports: [
    ReactiveFormsModule,
    AsyncPipe,
    CurrencyPipe,
    LowerCasePipe,
    DecimalPipe
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

  addMode: 'list' | 'scratch' = 'list';

  saleScratchItems: SaleScratchItem[] = [];
  saleItems: SaleItem[] = [];
  sum: number = 0;

  saleViewItems: SaleItemView[] = [];

  notification: { show: boolean; type: 'success' | 'error'; message: string } = {
    show: false,
    type: 'success',
    message: ''
  };

  readonly availableUnits = PRODUCT_UNITS;
  constructor(private fb: FormBuilder,private priceService: PriceListService,
              private clientService: ClientService,private saleService: SaleService) {
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
    const item = {
      name: name,
      internal: internal,
      unit: unit,
      unitPrice: unitPrice,
      amount: amount
    };

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
    this.saleScratchItems.push(item);
    this.sum+=sum1;
    this.newScratchItem.reset();
  }

  onAddFromList(){
    if(this.newItemForm.invalid){
      return;
    }
    const {productId, amount} = this.newItemForm.value;
    this.saleItems.push({
      prodId: productId,
      amount: amount
    });
    if(this.selectedProduct) {
      this.saleViewItems.push({
        prodId: productId,
        name: this.selectedProduct.name,
        internal: this.selectedProduct.internal,
        unit: this.selectedProduct.unit,
        unitPrice: this.selectedProduct.unitPrice,
        amount: amount,
        sum: this.grossPrice
      });
    }
    this.sum+=this.grossPrice;
    this.newItemForm.reset();
  }

  onClearListItem(){
    this.newItemForm.get('productId')?.setValue(null);
    this.grossPrice = 0.0;
  }
  onDeleteItem(item: SaleItemView,idx: number){
    if(item.prodId){
      this.saleItems = this.saleItems.filter(p => p.prodId !== item.prodId);
    }else{
      this.saleScratchItems = this.saleScratchItems.filter(p => p.name !== item.name)
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
      this.showNotification('error', 'Formularz jest niekompletny lub brak pozycji.');
      return;
    }
    const {saleName, clientId, note, warehouseNote } = this.infoForm.value;

    const saleCreationReq: SaleCreationReq = {
      saleName: saleName,
      clientId: clientId,
      saleData: note,
      warehouseNote: warehouseNote,
      saleItems: this.saleItems,
      customItems: this.saleScratchItems,
    }
    console.log(saleCreationReq);
    this.saleService.createSale(saleCreationReq).subscribe({
      next: (resp) => {
        this.newItemForm.reset();
        this.newScratchItem.reset();
        this.infoForm.reset();
        this.saleViewItems = [];
        this.saleItems = [];
        this.saleScratchItems = [];
        this.showNotification('success', 'Zamówienie zostało utworzone pomyślnie!');
      },
      error: (err: Error) => {
        this.showNotification('error', err.message);
      }
    })
  }
  showNotification(type: 'success' | 'error', message: string) {
    this.notification = { show: true, type, message };

    setTimeout(() => {
      this.notification.show = false;
    }, 4000);
  }
}

