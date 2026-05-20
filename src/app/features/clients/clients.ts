import {Component, OnInit} from '@angular/core';
import {ButtonSmall} from '../../shared/button-small/button-small';
import {NoteSection} from '../../layout/note-section/note-section';
import {ClientMaster} from '../../layout/client-master/client-master';
import {Router, RouterLink} from '@angular/router';
import {ClientService} from '../../core/client/client.service';
import {BehaviorSubject, filter, Observable, switchMap} from 'rxjs';
import {ClientDashboardInfo} from '../../core/client/models/client-dashboard-info';
import {AsyncPipe, CurrencyPipe, LowerCasePipe} from '@angular/common';
import {UserStateService} from '../../core/user/user-state.service';
import {PriceListService} from '../../core/pricelist/PriceListService';
import {FormatEnumPipe} from '../../shared/format-enum-pipe';

@Component({
  selector: 'app-clients',
  imports: [
    ButtonSmall,
    NoteSection,
    ClientMaster,
    RouterLink,
    AsyncPipe,
    CurrencyPipe,
    LowerCasePipe,
    FormatEnumPipe
  ],
  templateUrl: './clients.html',
})
export class Clients implements OnInit{
  selectedId$ = new BehaviorSubject<string | null>(null);
  _clientState!: Observable<ClientDashboardInfo>

  basePath!: string;
  constructor(private clientService: ClientService,private router: Router,
              private userState: UserStateService,private priceListService: PriceListService) {}

  ngOnInit(): void {
    this._clientState = this.selectedId$.pipe(
      filter(id => id !== null),
      switchMap(id => this.clientService.getDashboardInfo(id))
    );
    this.userState._basePath.subscribe({
      next: (val => {
        this.basePath = val;
      })
    })
  }

  onClientChanged(id: string) {
    this.selectedId$.next(id);
  }
  onSaleDetails(saleId: string){
    this.router.navigate([this.basePath,'sales'],{ state: { preselectedSaleId: saleId } });
  }
  onPriceListDetails(clientId: string){
    this.router.navigate([this.basePath,'prices','individual'],{ state: { preselectedClientId: clientId } });
  }
  onNewSale(clientId: string){
    this.router.navigate([this.basePath,'sales','new'],{ state: { preselectedClientId: clientId } });
  }
  onPrintPriceList(id: string){
    if(!id){
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
      }
    });
  }
}
