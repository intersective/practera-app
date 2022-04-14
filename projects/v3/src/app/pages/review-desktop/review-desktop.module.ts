import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ReviewDesktopPageRoutingModule } from './review-desktop-routing.module';
import { ReviewDesktopPage } from './review-desktop.page';
import { ComponentsModule } from '@v3/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    ReviewDesktopPageRoutingModule,
  ],
  declarations: [ReviewDesktopPage]
})
export class ReviewDesktopPageModule {}
