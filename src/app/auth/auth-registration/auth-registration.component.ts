import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { UtilsService } from "@services/utils.service";
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
    contact: null
  };
  domain = window.location.hostname;
  // validation errors array
  errors: Array<any> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private utils: UtilsService,
    private storage: BrowserStorageService,
    private formBuilder: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.domain =
      this.domain.indexOf("127.0.0.1") !== -1
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
      confirmPassword: new FormControl("", [
        Validators.required
      ])
    });
  }

  validateQueryParams() {
    // access query params
    this.route.queryParamMap.subscribe(queryParams => {
      let email = queryParams.get("email");
      this.user.email = email;
      let activation_code = queryParams.get("activation_code");
      if (email || activation_code) {
        // set query params to stroage
        this.storage.set("hash", {
          email: email,
          key: activation_code
        });
        // check is Url valid or not.
        this.authService
          .verifyRegistration({
            email: this.storage.get("hash").email,
            key: this.storage.get("hash").key
          })
          .subscribe(
            response => {
              let data = response.data.data;
              let user = data.user;
              let hash = this.storage.get("hash");
              this.user.email = email;
              this.user.contact = (data.User || {}).contact_number || null;
              let merge = { hash, user };
              this.storage.set("hash", merge);

              // get app configaration
              this.authService
                .checkDomain({
                  domain: this.domain
                })
                .subscribe(
                  response => {
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
                  },
                  err => {}
                );
            },
            error => {
              this.utils.popUp(
                "shortMessage",
                {
                  message: "Registration link invalid"
                },
                false
              );
            }
          );
      } else {
        this.utils.popUp(
          "shortMessage",
          {
            message: "Registration link invalid"
          },
          false
        );
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
    this.validateRegistration();
    if ((this.registerationForm.valid) && (this.errors.length === 0)) {
      this.authService
        .saveRegistration({
          password: this.confirmPassword
        })
        .subscribe(
          response => {
            this.authService
              .login({
                email: this.user.email,
                password: this.password
              })
              .subscribe(
                response => {
                  this.authService.me().subscribe(
                    response => {
                      this.utils
                        .popUp(
                          "shortMessage",
                          {
                            message: "Registration success"
                          },
                          false
                        )
                        .then(() => {});
                    },
                    error => {}
                  );
                },
                error => {}
              );
          },
          error => {}
        );
    }
  }

  removeErrorMessages() {
    this.errors = [];
  }

  validateRegistration() {
    this.errors = [];
    if (this.registerationForm.valid) {
      let pass = this.registerationForm.controls.password.value;
      let confirmPass = this.registerationForm.controls.confirmPassword.value;
      if (pass !== confirmPass) {
        this.errors.push("Your passwords don't match.");
      } else if (!this.isAgreed) {
        this.errors.push("You need to agree with terms and Conditions.");
      }
    } else {
      for (let conrtoller in this.registerationForm.controls) {
        for (let key in this.registerationForm.controls[conrtoller].errors) {
          if (this.registerationForm.controls[conrtoller].errors.hasOwnProperty(key)) {
            switch (key) {
              case "required":
                this.errors.push("Fill required field");
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
    // if (check) {
    //   if (this.password) {
    //     this.formValidationErrors.checkAgree = false;
    //     return true;
    //   } else {
    //     this.formValidationErrors.checkAgree = true;
    //     return false;
    //   }
    // } else {
    //   if (this.password) {
    //     this.formValidationErrors.needPassword = false;
    //     if (this.password.length > 8) {
    //       this.formValidationErrors.lengthError = false;
    //       if (this.password === this.confirmPassword) {
    //         this.formValidationErrors.passwordMismatch = false;
    //         return true;
    //       } else {
    //         this.formValidationErrors.passwordMismatch = true;
    //         return false;
    //       }
    //     } else {
    //       console.log(this.password.length);
    //       this.formValidationErrors.lengthError = true;
    //       return false;
    //     }
    //   } else {
    //     this.formValidationErrors.needPassword = true;
    //     return false;
    //   }
    // }
  }
}
