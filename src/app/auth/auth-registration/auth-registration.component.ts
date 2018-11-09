import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-auth-registration',
  templateUrl: './auth-registration.component.html',
  styleUrls: ['./auth-registration.component.scss']
})
export class AuthRegistrationComponent implements OnInit {

  password:String;
  rePassword:String;
  isAgreed:Boolean;

  constructor() { }

  ngOnInit() {
  }

}
