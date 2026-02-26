import { Component } from '@angular/core';
import {ButtonSmall} from '../../shared/button-small/button-small';

@Component({
  selector: 'app-login-form',
  imports: [
    ButtonSmall
  ],
  templateUrl: './login-form.html',
})
export class LoginForm {

  onSubmit(){
  }

}
