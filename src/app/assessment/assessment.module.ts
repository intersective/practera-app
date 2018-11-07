import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssessmentRoutingModule } from './assessment-routing.module';

import { AssessmentComponent } from './assessment.component';
import { QuestionsModule } from '../questions/questions.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    AssessmentRoutingModule,
    QuestionsModule
  ],
  declarations: [
    AssessmentComponent
  ],
 
})

export class AssessmentModule {
}
