import { NgModule } from '@angular/core';

import { EventsPageRoutingModule } from './events-routing.module';

import { EventsPage } from './events.page';
import { ComponentsModule } from '@v3/app/components/components.module';

@NgModule({
  imports: [
    ComponentsModule,
    EventsPageRoutingModule
  ],
  declarations: [EventsPage]
})
export class EventsPageModule {}
