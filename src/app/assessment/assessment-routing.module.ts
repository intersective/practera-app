import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssessmentComponent } from './assessment.component';
import { SinglePageDeactivateGuard } from "../single-page-deactivate.guard";

const routes: Routes = [
  {
    path: 'assessment/:activityId/:contextId/:id',
    component: AssessmentComponent,
    data: {
      action: 'assessment'
    },
    canDeactivate: [SinglePageDeactivateGuard],
  },
  {
    path: 'review/:contextId/:id/:submissionId',
    component: AssessmentComponent,
    data: {
      action: 'review'
    },
    canDeactivate: [SinglePageDeactivateGuard],
  },
  {
    path: 'event/:contextId/:id',
    component: AssessmentComponent,
    data: {
      action: 'assessment',
      from: 'events'
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssessmentRoutingModule {}
