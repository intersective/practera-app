import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ActivityComponent } from './activity.component';
import { ActivityRoutingComponent } from './activity-routing.component';

const routes: Routes = [
  {
    path: '',
    component: ActivityRoutingComponent,
    children: [
      {
        path: ':id',
        component: ActivityComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActivityRoutingModule {}
