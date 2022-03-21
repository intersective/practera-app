import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReviewListPageRoutingModule } from './review-list-routing.module';

import { ReviewListPage } from './review-list.page';
import { ComponentsModule } from '@v3/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReviewListPageRoutingModule,
    ComponentsModule,
  ],
  declarations: [ReviewListPage],
  exports: [ReviewListPage],
})
export class ReviewListPageModule {}
