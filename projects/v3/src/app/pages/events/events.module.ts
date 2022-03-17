import { NgModule } from '@angular/core';

import { EventsPageRoutingModule } from './events-routing.module';

import { EventsPage } from './events.page';
import { ComponentsModule } from '@v3/app/components/components.module';
import { PersonalisedHeaderModule } from '@v3/app/personalised-header/personalised-header.module';

@NgModule({
  imports: [
    ComponentsModule,
    EventsPageRoutingModule,
    PersonalisedHeaderModule
  ],
  declarations: [EventsPage]
})
export class EventsPageModule {}
