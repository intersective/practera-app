import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AssessmentComponent } from './assessment.component';

const routes: Routes = [
  { 
    path: 'assessment/:activityId/:id',
    component: AssessmentComponent, 
    data: {
      action: 'assessment'
    }
  },
  { 
    path: 'review/:id', 
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
