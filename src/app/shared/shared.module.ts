import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivityCardComponent } from '@shared/components/activity-card/activity-card.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
  ],
  declarations: [
    ActivityCardComponent
  ],
  exports: [
    ActivityCardComponent,
    IonicModule,
    CommonModule,
  ],
})
export class SharedModule {}