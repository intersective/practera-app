import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { V3PageRoutingModule } from './v3-routing.module';

import { V3Page } from './v3.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    V3PageRoutingModule
  ],
  declarations: [V3Page]
})
export class V3PageModule {}
