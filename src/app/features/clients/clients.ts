import {Component, OnInit} from '@angular/core';
import {ButtonSmall} from '../../shared/button-small/button-small';
import {NoteSection} from '../../layout/note-section/note-section';
import {ClientMaster} from '../../layout/client-master/client-master';
import {RouterLink} from '@angular/router';
import {ClientService} from '../../core/client/client.service';
import {BehaviorSubject, filter, Observable, switchMap} from 'rxjs';
import {ClientDashboardInfo} from '../../core/client/models/client-dashboard-info';
import {AsyncPipe, CurrencyPipe, LowerCasePipe} from '@angular/common';

@Component({
  selector: 'app-clients',
  imports: [
    ButtonSmall,
    NoteSection,
    ClientMaster,
    RouterLink,
    AsyncPipe,
    CurrencyPipe,
    LowerCasePipe
  ],
  templateUrl: './clients.html',
})
export class Clients implements OnInit{
  selectedId$ = new BehaviorSubject<string | null>(null);
  _clientState!: Observable<ClientDashboardInfo>
  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this._clientState = this.selectedId$.pipe(
      filter(id => id !== null),
      switchMap(id => this.clientService.getDashboardInfo(id))
    );
  }

  onClientChanged(id: string) {
    this.selectedId$.next(id);
  }
}
