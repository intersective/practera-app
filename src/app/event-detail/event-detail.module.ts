import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { EventDetailComponent } from './event-detail.component';
import { EventDetailService } from './event-detail.service';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    EventDetailComponent
  ],
  providers: [ EventDetailService ],
  exports: [ EventDetailComponent ],
  entryComponents: [ EventDetailComponent ]
})

export class EventDetailModule {}
