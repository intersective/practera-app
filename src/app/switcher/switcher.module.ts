import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SwitcherRoutingModule } from './switcher-routing.module';

import { SwitcherComponent } from './switcher.component';
import { SwitcherProgramComponent } from './switcher-program/switcher-program.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SwitcherRoutingModule
  ],
  declarations: [
    SwitcherComponent, 
    SwitcherProgramComponent
  ],
  entryComponents: [
  ]
})
export class SwitcherModule {}