import {Component, inject, signal} from '@angular/core';
import {ButtonSmall} from '../../shared/button-small/button-small';
import {AuthService} from '../../core/auth/auth.service';
import {Router} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AppError} from '../../core/error/AppError';

@Component({
  selector: 'app-login-form',
  imports: [
    ButtonSmall,
    ReactiveFormsModule
  ],
  templateUrl: './login-form.html',
})
export class LoginForm {
  errorMsg = signal<string | null>(null);
  isSubmitted = false;
  form = new FormGroup({
    mail: new FormControl<string>('', { nonNullable: true, validators: [Validators.email, Validators.required] }),
    password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] })
  });
  private authService =  inject(AuthService);

  onSubmit(){
    this.isSubmitted = true;
    if (this.form.invalid) {
      return;
    }
    if(this.form.valid) {
      const enteredEmail = this.form.value.mail!;
      const enteredPassword = this.form.value.password!;
      this.authService.login(enteredEmail,enteredPassword).subscribe({
        error: (err: AppError) => {
          this.isSubmitted = false;
          this.errorMsg.set(err.message);
        }
      });
    }
  }
  get mail() { return this.form.get('mail'); }
  get password() { return this.form.get('password'); }

}
