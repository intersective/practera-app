import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth-registration',
  templateUrl: './auth-registration.component.html',
  styleUrls: ['./auth-registration.component.scss']
})
export class AuthRegistrationComponent implements OnInit {

  password:String;
  missingParams:boolean = true;
  formValidationErrors:any = {
    checkAgree: false,
    needPassword: false,
    lengthError: false,
    passwordMismatch: false
  };
  rePassword:String;
  isAgreed:Boolean = false;
  user:any = {
    email: null,
    activation_code: null
  }

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private authService: AuthService) { }

  ngOnInit() {
    this.asseccQueryParams();
  }

  asseccQueryParams() {
    this.route.queryParamMap.subscribe(queryParams => {
      this.user.email = queryParams.get("email");
      this.user.activation_code = queryParams.get("activation_code");
      if (!(this.user.email) || !(this.user.activation_code)) {
        this.missingParams = true;
      } else {
        this.missingParams = false;
      }
    })
  }

  openLink() {
    window.open('https://images.practera.com/terms_and_conditions/practera_default_terms_conditions_july2018.pdf', '_system');
  }

  register() {
    if (this.validateRegistration(null)) {
      this.authService.saveRegistration(this.rePassword);
    }
  }

  removeErrorMessages() {
    this.formValidationErrors = {
      checkAgree: false,
      needPassword: false,
      lengthError: false,
      passwordMismatch: false
    };
  }

  validateRegistration(check) {
    if (check) {
      if (this.password) {
        this.formValidationErrors.checkAgree = false;
        return true;
      } else {
        this.formValidationErrors.checkAgree = true;
        return false;
      }
    } else {
      if (this.password) {
        this.formValidationErrors.needPassword = false;
        if (this.password.length > 8) {
          this.formValidationErrors.lengthError = false;
          if (this.password === this.rePassword) {
            this.formValidationErrors.passwordMismatch = false;
            return true;
          } else {
            this.formValidationErrors.passwordMismatch = true;
            return false;
          }
        } else {
          console.log(this.password.length);
          this.formValidationErrors.lengthError = true;
          return false;
        }
      } else {
        this.formValidationErrors.needPassword = true;
        return false;
      }
    }
  }

}
