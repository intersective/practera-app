import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AssessmentPage } from './assessment.page';

const routes: Routes = [
  {
    path: '',
    component: AssessmentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssessmentPageRoutingModule {}
