import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SwitcherComponent } from './switcher.component';
import { SwitcherProgramComponent } from './switcher-program/switcher-program.component';

import { SwitcherResolverService } from './switcher-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: SwitcherComponent,
    children: [
      {
        path: '',
        redirectTo: '/switcher/switcher-program'
      },
      {
        path: 'switcher-program',
        component: SwitcherProgramComponent,
        resolve: [ SwitcherResolverService ]
      }
    ]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class SwitcherRoutingModule {}
