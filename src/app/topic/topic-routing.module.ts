import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TopicComponent }    from './topic.component';

const TopicRoutes: Routes = [
  { path: '',  component: TopicComponent }
 
];

@NgModule({
  imports: [
    RouterModule.forChild(TopicRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class TopicRoutingModule { }