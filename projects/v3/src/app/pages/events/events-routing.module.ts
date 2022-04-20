import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventsPage } from './events.page';
import { EventsRoutingComponent } from './events-routing.component';

const routes: Routes = [
  {
    path: '',
    component: EventsRoutingComponent,
    children: [
      {
        path: '',
        component: EventsPage
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventsPageRoutingModule {}
