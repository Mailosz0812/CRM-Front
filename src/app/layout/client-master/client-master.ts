import {Component, OnInit} from '@angular/core';
import {ButtonSmall} from '../../shared/button-small/button-small';
import {RouterLink} from '@angular/router';
import {UserStateService} from '../../core/user/user-state.service';
import {Observable, tap} from 'rxjs';
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
  isSidebarOpen = false;
  _clients!: Observable<ClientShortResp[]>
  selectedClientId: string | null = null;


  constructor(public userState: UserStateService, private clientService: ClientService){
  }

  ngOnInit(): void {
    this._clients = this.clientService.getClientsList().pipe(
      tap(clients => {
        if (clients.length > 0 && !this.selectedClientId) {
          this.selectedClientId = clients[0].id;
        }
      })
    );
  }

  selectClient(client: ClientShortResp) {
    this.selectedClientId = client.id;
  }

}
