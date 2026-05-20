import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AsyncPipe} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {BehaviorSubject, map, Observable} from 'rxjs';
import {ListItem} from '../../core/pricelist/models/price-list-response';
import {ProductService} from '../../core/pricelist/ProductService';
import {combineLatest} from 'rxjs'
import {Category} from '../../core/pricelist/models/category';

@Component({
  selector: 'app-products-filter',
    imports: [
        AsyncPipe,
        ReactiveFormsModule
    ],
  templateUrl: './products-filter.html',
})
export class ProductsFilter implements OnInit{
  @Input({
    required: true
  }) products!: Observable<ListItem[]>;

  @Output() onFilterProducts = new EventEmitter<ListItem[]>();

  producers$!: Observable<string[]>;
  categories$!: Observable<Category[]>;
  private searchTerm$ = new BehaviorSubject<string>('');
  private selectedProducer$ = new BehaviorSubject<string | null>(null);
  private selectedDate$ = new BehaviorSubject<string | null>(null);
  private selectedCategory$ = new BehaviorSubject<string | null>(null);

  constructor(private productService: ProductService) {}
  ngOnInit(): void {
    this.producers$ = this.productService.getProducts();
    this.categories$ = this.productService.getCategories();

    combineLatest([this.products, this.searchTerm$, this.selectedProducer$, this.selectedDate$, this.selectedCategory$])
      .pipe(
        map(([base,term,producer,date,category]) => {
          let list = [...base];

          if(term){
            const termToLower = term.toLowerCase();
            list = list.filter(item =>
              item.name.toLowerCase().includes(termToLower) ||
              item.internal?.toLowerCase().includes(termToLower));
          }

          if(category){
            list = list.filter(item => item.category === category)
          }

          if(producer){
            list = list.filter(item => item.producer === producer)
          }

          if(date){
            list = list.filter(i => i.tps?.startsWith(date));
          }
          return list;
    })
      ).subscribe(filtered => {
        this.onFilterProducts.emit(filtered);
    });
  }

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm$.next(value);
  }

  onProducerChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedProducer$.next(value === 'null' ? null : value);
  }

  onDateChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.selectedDate$.next(value || null);
  }
  onCategoryChange(event: Event){
    const value = (event.target as HTMLInputElement).value;
    this.selectedCategory$.next(value === 'null' ? null : value);
  }

}
