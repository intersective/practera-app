import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DevtoolPageRoutingModule } from './devtool-routing.module';

import { DevtoolPage } from './devtool.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DevtoolPageRoutingModule,
    ComponentsModule,
  ],
  declarations: [DevtoolPage]
})
export class DevtoolPageModule {}
