import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-auth-registration',
  templateUrl: './auth-registration.component.html',
  styleUrls: ['./auth-registration.component.scss']
})
export class AuthRegistrationComponent implements OnInit {

  password:String;
  rePassword:String;
  isAgreed:Boolean = false;
  hide_password:Boolean = false;
  user:any = {
    email: 'test@test.com',
    contact: '0094710453447'
  }

  constructor() { }

  ngOnInit() {
  }

  openLink() {
    window.open('https://images.practera.com/terms_and_conditions/practera_default_terms_conditions_july2018.pdf', '_system');
  }

}
