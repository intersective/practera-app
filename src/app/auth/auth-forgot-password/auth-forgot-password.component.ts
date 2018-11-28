import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UtilsService } from '@services/utils.service';

@Component({
  selector: 'app-auth-forgot-password',
  templateUrl: 'auth-forgot-password.component.html',
  styleUrls: ['auth-forgot-password.component.scss']
})
export class AuthForgotPasswordComponent {
  email = '';

  constructor(
    private router: Router,
    private utils: UtilsService
  ) {}

	async send() {
    // -- todo
    // call API to do forgot password logic
    
    // show pop up message for confirmation
    return this.utils.popUp('forgotPasswordConfirmation', {
      email: this.email
    }, ['login']);
	}

}