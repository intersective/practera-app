import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '@v3/app/components/components.module';
import { PageNotFoundPage } from './page-not-found.page';
import { PageNotFoundRoutingModule } from './page-not-found-routing.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ComponentsModule,
    PageNotFoundRoutingModule
  ],
  declarations: [PageNotFoundPage]
})
export class PageNotFoundModule { }
