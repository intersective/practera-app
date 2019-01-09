import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { UtilsService } from "@services/utils.service";
import { NotificationService } from '@shared/notification/notification.service';
import { Md5 } from "ts-md5/dist/md5";
import {
  Validators,
  FormControl,
  FormGroup,
  FormBuilder
} from "@angular/forms";

import { AuthService } from "../auth.service";
import { BrowserStorageService } from "@services/storage.service";

@Component({
  selector: "app-auth-registration",
  templateUrl: "./auth-registration.component.html",
  styleUrls: ["./auth-registration.component.scss"]
})
export class AuthRegistrationComponent implements OnInit {
  password: string;
  confirmPassword: string;
  isAgreed: boolean = false;
  registerationForm: FormGroup;
  hide_password: boolean = false;
  user: any = {
    email: null,
    activation_code: null,
    contact: null,
    id: null
  };
  domain = window.location.hostname;
  // validation errors array
  errors: Array<any> = [];

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private utils: UtilsService,
    private storage: BrowserStorageService,
    private notificationService: NotificationService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.domain =
      this.domain.indexOf("127.0.0.1") !== -1 ||
      this.domain.indexOf("localhost") !== -1
        ? "appdev.practera.com"
        : this.domain;
    this.validateQueryParams();
  }

  initForm() {
    this.registerationForm = new FormGroup({
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(8)
      ]),
      confirmPassword: new FormControl("", [Validators.required])
    });
  }

  validateQueryParams() {
    let redirect = [];
    redirect = ['login'];
    // access query params
    this.route.queryParamMap.subscribe(queryParams => {
      let email = queryParams.get("email");
      this.user.email = email;
      this.user.activation_code = queryParams.get("activation_code");
      if (email && this.user.activation_code) {
        // check is Url valid or not.
        this.authService
          .verifyRegistration({
            email: email,
            key: this.user.activation_code
          }).subscribe(response => {
              if (response) {
                let user = response.data.User;
                // Setting user data after registration verified.
                this.user.email = email;
                this.user.contact = (user || {}).contact_number || null;
                this.user.id = user.id;

                // Update storage data
                this.storage.setUser({
                  contactNumber: this.user.contact,
                  email: this.user.email
                });

                // get app configaration
                this.authService
                  .checkDomain({
                    domain: this.domain
                  })
                  .subscribe(response => {
                      var data = (response.data || {}).data;
                      data = this.utils.find(data, function(datum) {
                        return (
                          datum.config && datum.config.auth_via_contact_number
                        );
                      });

                      if (data && data.config) {
                        if (data.config.auth_via_contact_number === true) {
                          this.hide_password = true;
                          this.user.password = this.autoGeneratePassword();
                          this.confirmPassword = this.user.password;
                        }
                      }
                    },err => {
                      this.showPopupMessages('shortMessage', 'Registration link invalid!',redirect);
                    }
                  );
              }
            },err => {
              console.log("error");
              this.showPopupMessages('shortMessage', 'Registration link invalid!',redirect);
            }
          );
      } else {
        this.showPopupMessages('shortMessage', 'Registration link invalid!',redirect);
      }
    });
  }

  private autoGeneratePassword() {
    let text = Md5.hashStr("").toString();
    let autoPass = text.substr(0, 8);
    return autoPass;
  }

  openLink() {
    window.open(
      "https://images.practera.com/terms_and_conditions/practera_default_terms_conditions_july2018.pdf",
      "_system"
    );
  }

  register() {
    if (this.validateRegistration()) {
      this.authService
        .saveRegistration({
          password: this.confirmPassword,
          user_id:this.user.id,
          key: this.user.activation_code
        })
        .subscribe(response => {
            this.authService
              .login({
                email: this.user.email,
                password: this.confirmPassword
              })
              .subscribe(response => {
                  let redirect = ['switcher'];
                  this.showPopupMessages('shortMessage', 'Registration success!', redirect);
                },
                error => {
                  this.showPopupMessages('shortMessage', 'Registration not compleate!');
                }
              );
          },
          error => {
            this.showPopupMessages('shortMessage', 'Registration not compleate!');
          }
        );
    }
  }

  removeErrorMessages() {
    this.errors = [];
  }

  validateRegistration() {
    let isValid = true;
    this.errors = [];
    if (this.hide_password) {
      if (!this.isAgreed) {
        this.errors.push("You need to agree with terms and Conditions.");
        isValid = false;
        return isValid;
      } else {
        return isValid;
      }
    } else if (this.registerationForm.valid) {
      let pass = this.registerationForm.controls.password.value;
      let confirmPass = this.registerationForm.controls.confirmPassword.value;
      if (pass !== confirmPass) {
        this.errors.push("Your passwords don't match.");
        isValid = false;
        return isValid;
      } else if (!this.isAgreed) {
        this.errors.push("You need to agree with terms and Conditions.");
        isValid = false;
        return isValid;
      } else {
        return isValid;
      }
    } else {
      for (let conrtoller in this.registerationForm.controls) {
        if (this.registerationForm.controls[conrtoller].errors) {
          isValid = false;
          for (let key in this.registerationForm.controls[conrtoller].errors) {
            if (
              this.registerationForm.controls[conrtoller].errors.hasOwnProperty(
                key
              )
            ) {
              switch (key) {
                case "required":
                  this.errors.push("Please fill in your password");
                  break;
                case "minlength":
                  this.errors.push(
                    "Your password needs to be more than 8 characters."
                  );
                  break;
                default:
                  this.errors.push(this.registerationForm.controls.errors[key]);
              }
              return;
            }
          }
        }
      }
      return isValid;
    }
  }

  private showPopupMessages(type: string, message: string, redirect?:any) {
    this.notificationService
      .popUp(
        type,
        {
          message: message
        },
        redirect ? redirect : false
      );
  }

}
