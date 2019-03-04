import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthRoutingModule } from './auth-routing.module';

import { AuthService } from './auth.service';

import { UnauthorizedGuard } from './unauthorized.guard';
import { AuthComponent } from './auth.component';
import { AuthLoginComponent } from './auth-login/auth-login.component';
import { AuthForgotPasswordComponent } from './auth-forgot-password/auth-forgot-password.component';
import { AuthRegistrationComponent } from './auth-registration/auth-registration.component';
import { AuthResetPasswordComponent } from './auth-reset-password/auth-reset-password.component';
import { AuthDirectLoginComponent } from './auth-direct-login/auth-direct-login.component';

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
    AuthRegistrationComponent,
    AuthResetPasswordComponent,
    AuthDirectLoginComponent
  ],
  entryComponents: [
    AuthComponent
  ],
  providers: [ AuthService, UnauthorizedGuard ],
})
export class AuthModule {}
