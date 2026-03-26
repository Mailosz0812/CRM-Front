import {Component, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ClientService} from '../../../core/client/client.service';
import {catchError, EMPTY, Observable, of, tap} from 'rxjs';
import {AsyncPipe} from '@angular/common';
import {ButtonSmall} from '../../../shared/button-small/button-small';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-client-details',
  imports: [
    AsyncPipe,
    ButtonSmall,
    ReactiveFormsModule
  ],
  templateUrl: './client-details.html',
})
export class ClientDetails implements OnInit{
  clientId: string | null = null;
  _clientState!: Observable<ClientResponse | null>;
  editClientMode = false;
  isSubmitted = false;
  errorMsg = signal<string | null>(null);

  form = new FormGroup({
    name: new FormControl<string>('',{nonNullable: true, validators: [Validators.required]}),
    address: new FormControl<string>('',{nonNullable: true, validators: [Validators.required]}),
    phone: new FormControl<string>('',{nonNullable: true, validators: [Validators.required]}),
    mail: new FormControl<string>('',{nonNullable: true, validators: [Validators.required,Validators.email]}),
    decisionPerson: new FormControl<string>('',{nonNullable: true}),
    }
  )

  constructor(private route: ActivatedRoute,private clientService: ClientService) {}

  ngOnInit(): void {
    this._clientState = this.clientService.clientState;
    this.clientId = this.route.snapshot.paramMap.get('id')
    this.clientService.getClientDetails(this.clientId!).subscribe({
      next: (client) => {
        if(client){
          this.form.patchValue({
            name: client.name,
            address: client.address,
            phone: client.phone,
            mail: client.mail,
            decisionPerson: client.decisionPerson
          });
        }
      }
    })
  }

  onEditClient(){
    this.editClientMode = true;
  }

  onSaveChanges(){
    this.editClientMode = false;
  }

  onSubmit(){
    this.isSubmitted = false;
    this.errorMsg.set(null);
    if(this.form.invalid){
      return;
    }

    const clientData: ClientUpdate = {
      ...this.form.getRawValue(),
      clientId: this.clientId!
    };
    this.clientService.updateClientDetails(clientData).subscribe({
      error: (err: Error) => {
        this.errorMsg.set(err.message);
      }
    })
  }


}
