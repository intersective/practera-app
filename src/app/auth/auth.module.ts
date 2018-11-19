import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthRoutingModule } from './auth-routing.module';

import { AuthService } from './auth.service';

import { AuthComponent } from './auth.component';
import { AuthLoginComponent } from './auth-login/auth-login.component';
import { AuthForgotPasswordComponent } from './auth-forgot-password/auth-forgot-password.component';
import { PopUpComponent } from '../components/pop-up/pop-up.component';
import { AuthRegistrationComponent } from './auth-registration/auth-registration.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AuthRoutingModule
  ],
  declarations: [
    AuthComponent, 
    AuthLoginComponent,
    AuthForgotPasswordComponent,
    PopUpComponent,
    AuthRegistrationComponent
  ],
  entryComponents: [
    PopUpComponent
  ],
  providers: [ AuthService ],
})
export class AuthModule {}