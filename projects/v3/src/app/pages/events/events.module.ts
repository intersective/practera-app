import { NgModule } from '@angular/core';

import { EventsPageRoutingModule } from './events-routing.module';

import { EventsPage } from './events.page';
import { ComponentsModule } from '@v3/app/components/components.module';
import { PersonalisedHeaderModule } from '@v3/app/personalised-header/personalised-header.module';
import { EventsRoutingComponent } from './events-routing.component';

import { EventDetailModule } from './event-detail/event-detail.module';
import { EventListModule } from './event-list/event-list.module';

@NgModule({
  imports: [
    ComponentsModule,
    EventsPageRoutingModule,
    PersonalisedHeaderModule,
    EventListModule,
    EventDetailModule,
  ],
  declarations: [EventsPage, EventsRoutingComponent]
})
export class EventsPageModule {}
