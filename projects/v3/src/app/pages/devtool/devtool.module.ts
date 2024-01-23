import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DevtoolPageRoutingModule } from './devtool-routing.module';

import { DevtoolPage } from './devtool.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DevtoolPageRoutingModule,
  ],
  declarations: [DevtoolPage]
})
export class DevtoolPageModule {}
