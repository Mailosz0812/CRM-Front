import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ButtonSmall} from '../../shared/button-small/button-small';
import {RouterLink} from '@angular/router';
import {UserStateService} from '../../core/user/user-state.service';
import {BehaviorSubject, combineLatest, map, Observable, tap} from 'rxjs';
import {AsyncPipe} from '@angular/common';
import {ClientService} from '../../core/client/client.service';
import {ClientShortResp} from '../../core/client/models/client-short-resp';

@Component({
  selector: 'app-client-master',
  imports: [
    ButtonSmall,
    RouterLink,
    AsyncPipe
  ],
  templateUrl: './client-master.html',
})
export class ClientMaster implements OnInit{
  @Output() clientSelected = new EventEmitter<string>();
  @Input() selectedClient!: string | null;

  isSidebarOpen = false;
  _clients!: Observable<ClientShortResp[]>
  selectedClientId: string | null = null;

  searchTerm$ = new BehaviorSubject<string>('');
  filteredClients!: Observable<ClientShortResp[]>;

  constructor(public userState: UserStateService, private clientService: ClientService){
  }

  ngOnInit(): void {
    this._clients = this.clientService.getClientsList().pipe(
      tap(clients => {
        if (clients.length > 0 && !this.selectedClientId) {
          if(this.selectedClient){
            this.selectedClientId = this.selectedClient;
          }else {
            this.selectedClientId = clients[0].id;
          }
          this.clientSelected.emit(this.selectedClientId);
        }
      })
    );
    this.filteredClients = combineLatest([this._clients, this.searchTerm$])
      .pipe(
        map(([clients, term]) => {
          let list: ClientShortResp[] = clients;
          if(term){
            list = clients.filter(c => c.name.includes(term))
          }
          return list;
        })
      );
  }

  selectClient(clientId: string) {
    this.selectedClientId = clientId;
    this.clientSelected.emit(clientId);
  }

  onTerm(event: Event){
    let term = (event.target as HTMLSelectElement).value;
    this.searchTerm$.next(term);
  }

}
