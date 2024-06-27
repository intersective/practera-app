import { first, takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Md5 } from 'ts-md5/dist/md5';
import {
  Validators,
  FormControl,
  FormGroup
} from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { UtilsService } from '@v3/services/utils.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { AuthService } from '@v3/services/auth.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { ExperienceService } from '@v3/services/experience.service';
import { TermsConditionsPreviewComponent } from '../terms-conditions-preview/terms-conditions-preview.component';
import { environment } from '@v3/environments/environment';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-auth-registration',
  templateUrl: './auth-registration.component.html',
  styleUrls: ['./auth-registration.component.scss']
})
export class AuthRegistrationComponent implements OnInit, OnDestroy {
  password: string;
  confirmPassword: string;
  isAgreed = false;
  registerationForm: FormGroup;
  hide_password = false;
  user: any = {
    email: null,
    key: null,
    contact: null,
    id: null
  };
  domain = window.location.hostname;
  // validation errors array
  errors: Array<any> = [];
  showPassword = false;
  // for unregisterd users using direct link
  unRegisteredDirectLink = false;
  isLoading = false; // loading registration trigger
  unsubscribe$: Subject<any> = new Subject<any>();

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    public utils: UtilsService,
    private storage: BrowserStorageService,
    private notificationsService: NotificationsService,
    private experienceService: ExperienceService,
    private modalController: ModalController,
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.domain =
      this.domain.indexOf('127.0.0.1') !== -1 ||
      this.domain.indexOf('localhost') !== -1
        ? 'appdev.practera.com'
        : this.domain;
    this.validateQueryParams();
    if (this.storage.get('unRegisteredDirectLink')) {
      this.unRegisteredDirectLink = true;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  initForm() {
    this.registerationForm = new FormGroup({
      email: new FormControl('', [Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8)
      ]),
      confirmPassword: new FormControl('', [Validators.required])
    });
  }

  validateQueryParams() {
    let redirect = [];
    redirect = ['auth', 'login'];

    // access query params
    this.route.queryParamMap
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(queryParams => {
      this.user.email = this.route.snapshot.paramMap.get('email');
      this.user.key = this.route.snapshot.paramMap.get('key');
      if (environment.demo && (this.user.key === 'unRegister')) {
        this.unRegisteredDirectLink = true;
      }
      if (this.user.email && this.user.key) {
        // check is Url valid or not.
        this.authService.verifyRegistration({
            email: this.user.email,
            key: this.user.key
        }).pipe(first())
          .subscribe({
            next: response => {

              if (response) {
                const user = response.data.User;
                // Setting user data after registration verified.
                this.user.contact = (user || {}).contact_number || null;
                this.user.id = user.id;

                // Update storage data
                this.storage.setUser({
                  contactNumber: this.user.contact,
                  email: this.user.email
                });

                // get app configaration
                this.authService.checkDomain({
                  domain: this.domain
                })
                .pipe(first())
                .subscribe({
                  next: res => {

                    let data = (res.data || {}).data;
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
                  error: err => {
                    console.error('domain-check::', err);
                    this.showPopupMessages('shortMessage', $localize`Registration link invalid!`, redirect);
                  }
                });
              }
            },
            error: error => {
              console.error('verification::', error);
              this.showPopupMessages('shortMessage', $localize`Registration link invalid!`, redirect);
            }
          });
      } else {
        this.showPopupMessages('shortMessage', $localize`Registration link invalid!`, redirect);
      }
    });
  }

  private autoGeneratePassword() {
    const text = Md5.hashStr('').toString();
    const autoPass = text.substr(0, 8);
    return autoPass;
  }

  openLink(): void {
    const fileURL = 'https://images.practera.com/terms_and_conditions/practera_terms_conditions.pdf';
    window.open(fileURL, '_system');
  }

  register() {
    this.isLoading = true;

    if (this.validateRegistration()) {
      if (this.unRegisteredDirectLink) {
        this._setupPassword();
      }
      this.authService
        .saveRegistration({
          password: this.confirmPassword,
          user_id: this.user.id,
          key: this.user.key
        })
        .pipe(first())
        .subscribe(
          response => {
            this.authService
              .authenticate({
                apikey: response.apikey,
              })
              .pipe(first())
              .subscribe(
                async res => {
                  this.storage.set('isLoggedIn', true);
                  this.storage.remove('unRegisteredDirectLink');
                  await this.experienceService.switchProgram({
                    experience: res?.data?.auth?.experience
                  });

                  this.isLoading = false;
                  this.showPopupMessages('shortMessage', $localize`Registration success!`, ['v3', 'home']);
                },
                err => {
                  this.isLoading = false;
                  console.error(err);
                  this.showPopupMessages('shortMessage', $localize`Registration not complete!`);
                }
              );
          },
          async (error: HttpErrorResponse) => {
            this.isLoading = false;
            const errorData = error?.error?.data;
            if (errorData?.type === 'password_compromised') {
              return await this.notificationsService.alert({
                message: $localize`We’ve checked this password against a global database of insecure passwords and your password was on it.<br>Please try again.<br>You can learn more about how we check that <a href="https://haveibeenpwned.com/Passwords">database</a>`,
                buttons: [
                  {
                    text: $localize`OK`,
                    role: 'cancel'
                  }
                ],
              });
            }

            this.showPopupMessages('shortMessage', $localize`Registration not complete!`);
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
    if (this.unRegisteredDirectLink) {
      if (!this.isAgreed) {
        this.errors.push($localize`You need to agree with terms and Conditions.`);
        this.isLoading = false;
        isValid = false;
        return isValid;
      } else {
        return isValid;
      }
    }
    if (this.hide_password) {
      if (!this.isAgreed) {
        this.errors.push($localize`You need to agree with terms and Conditions.`);
        this.isLoading = false;
        isValid = false;
        return isValid;
      } else {
        return isValid;
      }
    } else if (this.registerationForm.valid) {
      const pass = this.registerationForm.controls.password.value;
      const confirmPass = this.registerationForm.controls.confirmPassword.value;
      if (pass !== confirmPass) {
        this.isLoading = false;

        this.errors.push($localize`Your passwords don\'t match.`);
        isValid = false;
        return isValid;
      } else if (!this.isAgreed) {
        this.isLoading = false;

        this.errors.push($localize`You need to agree with terms and Conditions.`);
        isValid = false;
        return isValid;
      } else {
        return isValid;
      }
    } else {
      for (const controller in this.registerationForm.controls) {
        const control = this.registerationForm.controls[controller];
        if (control.errors) {
          this.isLoading = false;
          isValid = false;
          for (const key in control.errors) {
            switch (key) {
              case 'required':
                this.errors.push($localize`Please fill in your password`);
                break;
              case 'minlength':
                this.errors.push(
                  $localize`Your password needs to be more than 8 characters.`
                );
                break;
              default:
                this.errors.push(control.errors[key]);
            }
            return;
          }
        }
      }
      return isValid;
    }
  }

  private showPopupMessages(type: string, message: string, redirect?: any) {
    this.notificationsService.popUp(
      type,
      {
        message: message
      },
      redirect ? redirect : false
    );
  }

  private _setupPassword() {
    if (this.password) {
      this.user.password = this.password;
    } else {
      this.user.password = this.autoGeneratePassword();
    }
    this.confirmPassword = this.user.password;
  }

  async termsAndConditionsPopup() {
    const modal = await this.modalController.create({
      component: TermsConditionsPreviewComponent,
      swipeToClose: false,
      backdropDismiss: false
    });
    await modal.present();
    modal.onWillDismiss().then((modalData) => {
      if (modalData.data && (modalData.data.isAgreed)) {
        this.isAgreed = modalData.data.isAgreed;
      }
    });
  }

}
