import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthRoutingModule } from './auth-routing.module';

import { AuthService } from './auth.service';

import { AuthComponent } from './auth.component';
import { AuthLoginComponent } from './auth-login/auth-login.component';
import { AuthForgotPasswordComponent } from './auth-forgot-password/auth-forgot-password.component';
import { AuthSwitcherComponent } from './auth-switcher/auth-switcher.component';
import { NotificationComponent } from '../components/notification/notification.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    AuthRoutingModule
  ],
  declarations: [
    AuthComponent, 
    AuthLoginComponent,
    AuthForgotPasswordComponent,
    AuthSwitcherComponent,
    NotificationComponent
  ],
  entryComponents: [
    NotificationComponent
  ],
  providers: [ AuthService ],
})
export class AuthModule {}