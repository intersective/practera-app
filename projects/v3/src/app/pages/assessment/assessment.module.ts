import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { AssessmentPageRoutingModule } from './assessment-routing.module';

import { AssessmentPage } from './assessment.page';
import { ComponentsModule } from '@v3/app/components/components.module';
import { QuestionsModule } from '@v3/app/questions/questions.module';

@NgModule({
  imports: [
    ReactiveFormsModule,
    AssessmentPageRoutingModule,
    ComponentsModule,
    QuestionsModule,
  ],
  declarations: [AssessmentPage],
  exports: [
    AssessmentPage,
  ]
})
export class AssessmentPageModule {}
