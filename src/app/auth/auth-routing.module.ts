import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthComponent } from './auth.component';
import { AuthLoginComponent } from './auth-login/auth-login.component';
import { AuthForgotPasswordComponent } from './auth-forgot-password/auth-forgot-password.component';
import { AuthSwitcherComponent } from './auth-switcher/auth-switcher.component';

const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        component: AuthLoginComponent
      },
      {
        path: 'forgot_password',
        component: AuthForgotPasswordComponent
      },
      {
        path: 'switcher',
        component: AuthSwitcherComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
