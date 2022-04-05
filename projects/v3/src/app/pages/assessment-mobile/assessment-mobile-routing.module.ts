import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SinglePageDeactivateGuard } from '@v3/app/guards/single-page-deactivate.guard';

import { AssessmentMobilePage } from './assessment-mobile.page';

const routes: Routes = [
  {
    path: 'assessment/:activityId/:contextId/:id',
    component: AssessmentMobilePage,
    data: {
      action: 'assessment'
    },
    canDeactivate: [SinglePageDeactivateGuard],
  },
  {
    path: 'assessment/:activityId/:contextId/:id/:submissionId',
    component: AssessmentMobilePage,
    data: {
      action: 'assessment'
    },
    canDeactivate: [SinglePageDeactivateGuard],
  },
  {
    path: 'review/:contextId/:id/:submissionId',
    component: AssessmentMobilePage,
    data: {
      action: 'review'
    },
    canDeactivate: [SinglePageDeactivateGuard],
  },
  {
    path: 'event/:contextId/:id',
    component: AssessmentMobilePage,
    data: {
      action: 'assessment',
      from: 'events'
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssessmentMobilePageRoutingModule {}
