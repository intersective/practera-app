import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthComponent } from './auth.component';
import { AuthLoginComponent } from './auth-login/auth-login.component';
import { AuthForgotPasswordComponent } from './auth-forgot-password/auth-forgot-password.component';
import { AuthRegistrationComponent } from './auth-registration/auth-registration.component';
import { AuthResetPasswordComponent } from './auth-reset-password/auth-reset-password.component';
import { AuthDirectLoginComponent } from './auth-direct-login/auth-direct-login.component';
import { UnauthorizedGuard } from './unauthorized.guard';
import { AuthResolverService } from './auth-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    resolve: {
      config: AuthResolverService,
    },
    children: [
      {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        component: AuthLoginComponent,
        canActivate: [UnauthorizedGuard],
      },
      {
        path: 'forgot_password',
        component: AuthForgotPasswordComponent,
        canActivate: [UnauthorizedGuard],
      },
      {
        path: 'registration/:email/:key',
        component: AuthRegistrationComponent,
        canActivate: [UnauthorizedGuard],
      },
      {
        path: 'reset_password/:key/:email',
        component: AuthResetPasswordComponent,
        canActivate: [UnauthorizedGuard],
      },
      {
        path: 'secure/:authToken',
        component: AuthDirectLoginComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
