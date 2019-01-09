import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivityCardComponent } from '@shared/components/activity-card/activity-card.component';
import { LinkifyPipe } from './pipes/linkify/linkify.pipe';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
  ],
  declarations: [
    ActivityCardComponent,
    LinkifyPipe
  ],
  exports: [
    ActivityCardComponent,
    IonicModule,
    CommonModule,
  ],
})
export class SharedModule {}