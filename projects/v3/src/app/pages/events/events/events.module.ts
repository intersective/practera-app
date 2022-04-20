import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { EventsRoutingComponent } from './events-routing.component';
import { EventsRoutingModule } from './events-routing.module';
import { EventsComponent } from './events.component';
import { EventListModule } from '../event-list/event-list.module';
import { EventDetailModule } from '../event-detail/event-detail.module';
import { AssessmentModule } from '../assessment/assessment.module';

@NgModule({
  declarations: [
    EventsComponent,
    EventsRoutingComponent
  ],
  imports: [
    SharedModule,
    EventsRoutingModule,
    EventListModule,
    EventDetailModule,
    AssessmentModule
  ]
})
export class EventsModule { }
