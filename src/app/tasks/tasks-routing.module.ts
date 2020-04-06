import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TasksRoutingComponent } from './tasks-routing.component';
import { TasksComponent } from './tasks.component';

const routes: Routes = [
  {
    path: '',
    component: TasksRoutingComponent,
    children: [
      {
        path: ':id',
        component: TasksComponent
      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksRoutingModule { }
