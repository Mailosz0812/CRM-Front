import {Component, signal} from '@angular/core';
import {PriceListService} from '../../../core/pricelist/PriceListService';
import {ActivatedRoute, Router} from '@angular/router';
import {AsyncPipe, CurrencyPipe, LowerCasePipe} from '@angular/common';
import {ButtonSmall} from '../../../shared/button-small/button-small';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {PRODUCT_UNITS} from '../../../core/pricelist/models/unit.model';
import {PriceList} from '../../../core/pricelist/models/PriceList';
import {CATEGORIES} from '../../../core/pricelist/models/category.model';
import {UserStateService} from '../../../core/user/user-state.service';

@Component({
  selector: 'app-price-list-creation',
  imports: [
    AsyncPipe,
    ButtonSmall,
    FormsModule,
    ReactiveFormsModule,
    CurrencyPipe,
    LowerCasePipe
  ],
  templateUrl: './price-list-creation.html',
})
export class PriceListCreation{
  private clientId!: string | null;
  private basePath!: string | null;
  availableUnits = PRODUCT_UNITS;
  availableCategories = CATEGORIES;
  form: FormGroup;
  newItemForm: FormGroup;


  constructor(private fb: FormBuilder,private priceService: PriceListService,
              private route: ActivatedRoute,private router: Router,
              private userState: UserStateService
  ) {
    this.clientId = this.route.snapshot.paramMap.get('id');
    this.userState._basePath.subscribe({
      next: (path) => {
        this.basePath = path;
      }
      }
    )

    this.form = this.fb.group({
      listTitle: ['', Validators.required],
      items: this.fb.array([])
    });

    this.newItemForm = this.fb.group({
      name: ['', Validators.required],
      internal: ['',Validators.required],
      unitPrice: [null, [Validators.required, Validators.min(0)]],
      unit: [null, [Validators.required]],
      prodCategory: [null,[Validators.required]]
    });
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  addItem() {
    if (this.newItemForm.valid) {
      const { name, unitPrice, unit,prodCategory ,internal} = this.newItemForm.value;

      const itemGroup = this.fb.group({
        name: [name, Validators.required],
        internalName: [internal, Validators.required],
        unitPrice: [unitPrice, Validators.required],
        unit: [unit,Validators.required],
        prodCategory: [prodCategory,Validators.required]
      });

      this.items.push(itemGroup);

      this.newItemForm.reset();
    }
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  onSubmit() {
    if(this.form.invalid){
      return;
    }
    const priceList: PriceList = {
      ...this.form.getRawValue(),
      clientId: this.clientId
    }
    console.log(priceList);
    this.priceService.createPriceList(priceList).subscribe({
      next: (resp)=> {
        this.form.reset();
        this.items.clear();
        this.router.navigate([this.basePath,'prices'])
      },
      error: (err: Error) => {
        console.log(err);
      }
    });
  }

}
