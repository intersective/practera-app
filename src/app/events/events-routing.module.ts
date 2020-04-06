import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EventsRoutingComponent } from './events-routing.component';
import { EventsComponent } from './events.component';

const routes: Routes = [
  {
    path: '',
    component: EventsRoutingComponent,
    children: [
      {
        path: '',
        component: EventsComponent
      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventsRoutingModule { }
