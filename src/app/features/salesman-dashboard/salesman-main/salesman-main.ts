import {Component, OnInit} from '@angular/core';
import {NoteSection} from '../../../layout/note-section/note-section';
import {FilterPill} from '../../../shared/fitler-pill/filter-pill.component';
import {ButtonSmall} from '../../../shared/button-small/button-small';
import {Router, RouterLink} from '@angular/router';
import {SalesmanService} from '../../../core/salesman/SalesmanService';
import {Observable} from 'rxjs';
import {SalesmanView} from '../../../core/salesman/models/SalesmanView';
import {AsyncPipe, DecimalPipe, LowerCasePipe, UpperCasePipe} from '@angular/common';
import {FormatEnumPipe} from '../../../shared/format-enum-pipe';
import {UserStateService} from '../../../core/user/user-state.service';
import {SALE_STAGES, SaleStages} from '../../../core/sale/models/Stage.model';

@Component({
  selector: 'app-salesman-main',
  imports: [
    NoteSection,
    FilterPill,
    ButtonSmall,
    RouterLink,
    AsyncPipe,
    FormatEnumPipe,
    UpperCasePipe,
    DecimalPipe,
    LowerCasePipe
  ],
  templateUrl: './salesman-main.html',
})
export class SalesmanMain implements OnInit{
  private stage: SaleStages | null = null;
  salesmanView!: Observable<SalesmanView>
  basePath!: string;
  constructor(private salesmanService: SalesmanService, private router: Router,
              private userState: UserStateService) {
    this.userState._basePath.subscribe({
      next: (val => {
        this.basePath = val;
      })
    })
  }

  ngOnInit(): void {
    this.salesmanView = this.salesmanService.getSalesmanView();
  }

  onSaleDetails(saleId: string){
    this.router.navigate([this.basePath,"sales"],{ state: { preselectedSaleId: saleId } })
  }
  onAddParam(stage: SaleStages){
    this.stage = stage;
  }
}
