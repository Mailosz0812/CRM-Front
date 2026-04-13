import {Component} from '@angular/core';
import {ClientMaster} from '../../layout/client-master/client-master';
import {ButtonSmall} from '../../shared/button-small/button-small';
import {UserStateService} from '../../core/user/user-state.service';
import {AsyncPipe, CurrencyPipe, DatePipe, LowerCasePipe, NgClass} from '@angular/common';
import {BehaviorSubject, catchError, map, Observable, of, take, tap} from 'rxjs';
import {RouterLink} from '@angular/router';
import {PriceListService} from '../../core/pricelist/PriceListService';
import {PriceListShort} from '../../core/pricelist/models/price-list-short';
import {ListItem} from '../../core/pricelist/models/price-list-response';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {PRODUCT_UNITS} from '../../core/pricelist/models/unit.model';
import {CATEGORIES} from '../../core/pricelist/models/category.model';

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
    LowerCasePipe
  ],
  templateUrl: './price-list.html',
})
export class PriceList{
  private productSubject = new BehaviorSubject<ListItem[]>([]);
  private productsBackup: ListItem[] = [];

  editPriceListMode = false;
  selectedId$ = new BehaviorSubject<string | null>(null);
  selectedListId: string | null = null;
  selectedPriceList!: Observable<PriceListShort[]>;
  selectedProducts: Observable<ListItem[]> = this.productSubject.asObservable();
  newItemForm!: FormGroup;

  constructor(public userState: UserStateService,private priceService: PriceListService, private fb: FormBuilder) {
    this.newItemForm = this.fb.group({
        name: ['', Validators.required],
        internalName: ['', Validators.required],
        unitPrice: [null, [Validators.required, Validators.min(0)]],
        unit: [null, [Validators.required]],
        category: [null, [Validators.required]]
      }
    )
  }


  onEditList(){
    this.editPriceListMode = true;

    const currentProducts = this.productSubject.getValue();
    this.productsBackup = structuredClone(currentProducts);
  }
  onSaveList(){
    const updatedProducts = this.productSubject.getValue();

    this.priceService.updateListItems(updatedProducts,this.selectedListId!).subscribe({
      next: (resp)=> {
        this.editPriceListMode = false;
        this.productSubject.next(resp.productsList)
      },
      error: (err: Error) => {
        console.log(err);
      }
    });
  }
  onCancelList(){
    this.editPriceListMode = false;
    this.productSubject.next(this.productsBackup);
    this.productsBackup = [];
  }
  selectClient(id: string){
    this.selectedId$.next(id);

    this.selectedListId = null;
    this.productSubject.next([])

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
    this.priceService.getListItemsByListId(id).subscribe({
      next: (items) => {
        this.productSubject.next(items);
      }
      }
    )
  }

  onAddItem(){
    if(this.newItemForm.valid){
      const { name, unitPrice, unit,category, internalName } = this.newItemForm.value;

      const listItem: ListItem = {
        id: null,
        internal: internalName,
        name: name,
        unitPrice: unitPrice,
        category: category,
        unit: unit,
      }
      const currentList = this.productSubject.getValue();
      this.productSubject.next([listItem ,...currentList]);
      this.newItemForm.reset();
    }
  }
  onRemoveItem(listItem: ListItem){
    const currentList = this.productSubject.getValue();
    if(currentList.length > 0) {
      this.productSubject.next(
        currentList.filter(item => item !== listItem)
      );
      this.newItemForm.reset();
    }
  }

  protected readonly availableUnits = PRODUCT_UNITS;
  protected readonly availableCategories = CATEGORIES;
}
