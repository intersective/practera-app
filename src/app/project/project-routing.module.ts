import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProjectComponent } from './project.component';
import { ProjectRoutingComponent } from './project-routing.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectRoutingComponent,
    children: [
      {
        path: '',
        component: ProjectComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule {}