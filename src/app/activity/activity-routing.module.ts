import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ActivityComponent } from './activity.component';
import { ActivityRoutingComponent } from './activity-routing.component';
import { EventResolverService } from '../events/event-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: ActivityRoutingComponent,
    children: [
      {
        path: ':id',
        component: ActivityComponent,
        resolve: {
          events: EventResolverService,
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActivityRoutingModule {}
