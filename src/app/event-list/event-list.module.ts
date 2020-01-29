import { SharedModule } from '@shared/shared.module';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { EventListComponent } from './event-list.component';
import { EventListService } from './event-list.service';

@NgModule({
  imports: [
    SharedModule,
  ],
  declarations: [
    EventListComponent
  ],
  providers: [
    EventListService
  ],
  exports: [
    EventListComponent
  ]
})

export class EventListModule {
}
