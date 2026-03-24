import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ClientService} from '../../../core/client/client.service';
import {Observable} from 'rxjs';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-client-details',
  imports: [
    AsyncPipe
  ],
  templateUrl: './client-details.html',
})
export class ClientDetails implements OnInit{
  clientId: string | null = null;
  _clientState!: Observable<ClientCreationResp>;
  constructor(private route: ActivatedRoute,private clientService: ClientService) {}

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('id')
    this._clientState = this.clientService.getClientDetails(this.clientId!);
  }


}
