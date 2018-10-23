import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-forgot-password',
  templateUrl: 'auth-forgot-password.component.html',
  styleUrls: ['auth-forgot-password.component.css']
})
export class AuthForgotPasswordComponent {
  email = '';

  constructor(
    private router: Router
  ) {}

	send() {
    // -- todo
    // call API to do forgot password logic
		console.log("Forgot password - email: ", this.email);
    this.router.navigate(['/login']);
	}

  login() {
    this.router.navigate(['/login']); 
  }
}