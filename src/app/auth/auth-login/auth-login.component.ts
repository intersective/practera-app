import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Observable, concat } from 'rxjs';

@Component({
  selector: 'app-auth-login',
  templateUrl: 'auth-login.component.html',
  styleUrls: ['auth-login.component.scss']
})
export class AuthLoginComponent {
  email = '';
  password = '';

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

	login() {
    // -- todo
    // call API to do authentication
		console.log("Email: ", this.email, "\nPassword: ", this.password);
    this.authService.login({
      email: this.email,
      password: this.password,
    }).subscribe(res => {
      // hardcode login status
      console.log(res);
      this.router.navigate(['/switcher']);
    }, err => {
      // hardcode login status
      console.log(err);
      // should popup something instead
      this.router.navigate(['/switcher']);
    });
	}
}