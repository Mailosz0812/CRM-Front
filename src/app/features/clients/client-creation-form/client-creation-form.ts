import {Component, signal} from '@angular/core';
import {ClientService} from '../../../core/client/client.service';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ClientCreation} from '../../../core/client/models/client-creation';

@Component({
  selector: 'app-client-creation-form',
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './client-creation-form.html',
})
export class ClientCreationForm {
  isSubmitted = false;
  errorMsg = signal<string | null>(null);
  form = new FormGroup({
    name: new FormControl<string>('',{nonNullable: true, validators: [Validators.required]}),
    nipNumber: new FormControl<string>('',{nonNullable: true, validators: [Validators.required]}),
    address: new FormControl<string>('',{nonNullable: true, validators: [Validators.required]}),
    phone: new FormControl<string>('', {nonNullable: true, validators: [Validators.required]}),
    mail: new FormControl<string>('', {nonNullable: true, validators: [Validators.email, Validators.required]}),
    decisionPerson: new FormControl<string>('',{nonNullable: true})
  });
  happyMsg = signal<string | null>(null);
  constructor(private clientService: ClientService) {}

  onSubmit(){
    this.errorMsg.set(null)
    this.happyMsg.set(null)
    this.isSubmitted = true;
    if(this.form.invalid){
      return;
    }
    const clientData: ClientCreation = this.form.getRawValue();
    this.clientService.createClient(clientData).subscribe({
      next: (clientResp)=>{
        this.happyMsg.set(`Klient ${clientResp.name} dodany pomyślnie`)
      },
      error: (err: Error) => {
        this.isSubmitted = false;
        this.errorMsg.set(err.message);
      }
    });
  }
}
