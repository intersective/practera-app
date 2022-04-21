import { ComponentsModule } from '@v3/components/components.module';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { EventListComponent } from './event-list.component';
import { EventService } from '@v3/services/event.service';

@NgModule({
  imports: [
    ComponentsModule,
  ],
  declarations: [
    EventListComponent
  ],
  providers: [
    EventService
  ],
  exports: [
    EventListComponent
  ]
})

export class EventListModule {
}
