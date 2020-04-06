import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { ActivityRoutingModule } from './activity-routing.module';
import { ActivityRoutingComponent } from './activity-routing.component';
import { ActivityComponent } from './activity.component';
import { ActivityService } from './activity.service';

@NgModule({
  imports: [
    SharedModule,
    ActivityRoutingModule
  ],
  declarations: [
    ActivityRoutingComponent,
    ActivityComponent
  ],
  providers: [
    ActivityService
  ],
  exports: [
    ActivityComponent
  ]
})
export class ActivityModule {}
