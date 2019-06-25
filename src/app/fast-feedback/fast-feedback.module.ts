import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FastFeedbackComponent } from './fast-feedback.component';
import { FastFeedbackService } from './fast-feedback.service';
import { QuestionComponent } from './question/question.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    FastFeedbackComponent,
    QuestionComponent,
  ],
  providers: [ FastFeedbackService ],
  exports: [
    FastFeedbackComponent,
    FormsModule,
    IonicModule,
    CommonModule,
    ReactiveFormsModule,
  ]
})
export class FastFeedbackModule {}
