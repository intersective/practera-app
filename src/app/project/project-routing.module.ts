import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProjectComponent } from './project.component';
import { ActivityComponent } from '../activity/activity.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectComponent,
    children: [
    	{
    		path: '',
    		component: ActivityComponent,
    	}
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule {}