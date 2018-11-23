import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TeamComponent } from './team.component';
import { TeamListComponent } from './team-list/team-list.component';

const routes: Routes = [
  {
    path: '',
    component: TeamComponent,
    children: [
      {
        path: '',
        redirectTo: '/team/team-list'
      },
      {
        path: 'team-list',
        component: TeamListComponent
      }
    ]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class TeamRoutingModule {}
