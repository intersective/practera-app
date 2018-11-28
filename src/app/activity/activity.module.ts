import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivityRoutingModule } from './activity-routing.module';
import { ActivityRoutingComponent } from './activity-routing.component';
import { ActivityComponent } from './activity.component';
import { ActivityService } from './activity.service';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ActivityRoutingModule
  ],
  declarations: [
    ActivityRoutingComponent,
    ActivityComponent
  ],
  providers: [
    ActivityService
  ]
})
export class ActivityModule {}
