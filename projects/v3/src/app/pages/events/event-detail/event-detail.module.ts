import { NgModule } from '@angular/core';
import { ComponentsModule } from '@v3/components/components.module';
import { EventDetailComponent } from './event-detail.component';
import { EventService } from '@v3/services/event.service';

@NgModule({
  imports: [
    ComponentsModule
  ],
  declarations: [
    EventDetailComponent
  ],
  providers: [ EventService ],
  exports: [ EventDetailComponent ],
})

export class EventDetailModule {}
