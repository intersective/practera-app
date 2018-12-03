import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivityCardComponent } from './activity-card.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
  ],
  declarations: [
    ActivityCardComponent
  ],
  exports: [
    ActivityCardComponent
  ]  
})
export class ActivityCardModule {}
