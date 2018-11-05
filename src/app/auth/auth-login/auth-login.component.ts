import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-login',
  templateUrl: 'auth-login.component.html',
  styleUrls: ['auth-login.component.scss']
})
export class AuthLoginComponent {
  email = '';
  password = '';

  constructor(
    private router: Router
  ) {}

	login() {
    // -- todo
    // call API to do authentication
		console.log("Email: ", this.email, "\nPassword: ", this.password);
    this.router.navigate(['/switcher']);
	}

}