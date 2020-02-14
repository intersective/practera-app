import { SharedModule } from '@shared/shared.module';
import { NgModule } from '@angular/core';

import { SwitcherRoutingModule } from './switcher-routing.module';

import { SwitcherComponent } from './switcher.component';
import { SwitcherProgramComponent } from './switcher-program/switcher-program.component';

@NgModule({
  imports: [
    SharedModule,
    SwitcherRoutingModule,
  ],
  declarations: [
    SwitcherComponent,
    SwitcherProgramComponent
  ]
})
export class SwitcherModule {}
