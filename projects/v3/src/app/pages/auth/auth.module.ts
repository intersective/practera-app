import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthRoutingModule } from './auth-routing.module';

import { AuthService } from '@v3/services/auth.service';

import { UnauthorizedGuard } from '@v3/app/guards/unauthorized.guard';
import { ProgramSelectedGuard } from '@v3/app/guards/program-selected.guard';
import { AuthComponent } from './auth.component';
import { AuthLoginComponent } from './auth-login/auth-login.component';
import { AuthLogoutComponent } from './auth-logout/auth-logout.component';
import { AuthForgotPasswordComponent } from './auth-forgot-password/auth-forgot-password.component';
import { AuthRegistrationComponent } from './auth-registration/auth-registration.component';
import { AuthResetPasswordComponent } from './auth-reset-password/auth-reset-password.component';
import { AuthDirectLoginComponent } from './auth-direct-login/auth-direct-login.component';
import { AuthGlobalLoginComponent } from './auth-global-login/auth-global-login.component';
import { TermsConditionsPreviewComponent } from './terms-conditions-preview/terms-conditions-preview.component';

@NgModule({
  imports: [
    ComponentsModule,
    ReactiveFormsModule,
    AuthRoutingModule,
  ],
  declarations: [
    AuthComponent,
    AuthLoginComponent,
    AuthLogoutComponent,
    AuthForgotPasswordComponent,
    AuthRegistrationComponent,
    AuthResetPasswordComponent,
    AuthDirectLoginComponent,
    AuthGlobalLoginComponent,
    TermsConditionsPreviewComponent
  ],
  providers: [
    AuthService,
    UnauthorizedGuard,
    ProgramSelectedGuard,
  ],
  exports: [ComponentsModule]
})
export class AuthModule {}
