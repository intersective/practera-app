import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AssessmentComponent } from './assessment.component';

const routes: Routes = [
  { 
    path: 'assessment/:activityId/:contextId/:id',
    component: AssessmentComponent, 
    data: {
      action: 'assessment'
    }
  },
  { 
    path: 'review/:contextId/:id',
    component: AssessmentComponent,
    data: {
      action: 'review'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssessmentRoutingModule {}
