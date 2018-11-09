import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivityComponent } from './activity.component';
import { ActivityService } from './activity.service';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  declarations: [
    ActivityComponent
  ],
  providers: [
    ActivityService
  ]
})
export class ActivityModule {}
