import { SharedModule } from '@shared/shared.module';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AssessmentRoutingModule } from './assessment-routing.module';
import { ReactiveFormsModule } from '@angular/forms';

import { AssessmentComponent } from './assessment.component';
import { QuestionsModule } from '../questions/questions.module';
import { ActivityModule } from '../activity/activity.module';

@NgModule({
  imports: [
    SharedModule,
    AssessmentRoutingModule,
    ReactiveFormsModule,
    QuestionsModule,
    ActivityModule,
  ],
  declarations: [
    AssessmentComponent
  ],
  exports: [
    SharedModule,
    ActivityModule,
    AssessmentComponent
  ]
})

export class AssessmentModule {
}
