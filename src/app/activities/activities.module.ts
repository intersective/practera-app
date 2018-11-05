import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivitiesComponent } from './activities.component';
import { NgCircleProgressModule } from 'ng-circle-progress';


@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    NgCircleProgressModule,
    RouterModule.forChild([{ path: '', component: ActivitiesComponent }])
  ],
  declarations: [ActivitiesComponent]
})
export class ActivitiesModule {}
