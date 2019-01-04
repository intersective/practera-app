import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { Observable, concat } from 'rxjs';

@Component({
  selector: 'app-auth-secure',
  template: '',
  styles: ['']
})
export class AuthSecureComponent implements OnInit {
  email = '';
  password = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    let authToken = this.route.snapshot.paramMap.get('authToken');
    console.log(authToken);
  }

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