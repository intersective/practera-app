import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FastFeedbackRoutingComponent } from './fast-feedback-routing.component';
import { FastFeedbackComponent } from './fast-feedback.component';
import { FastFeedbackService } from './fast-feedback.service';
import { QuestionsModule } from '../questions/questions.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    QuestionsModule,
  ],
  declarations: [
  	FastFeedbackRoutingComponent, 
    FastFeedbackComponent,
  ],
  entryComponents: [ FastFeedbackRoutingComponent ],
  providers: [ FastFeedbackService ],
  exports: [
    FastFeedbackComponent,
    QuestionsModule,
  ]
})
export class FastFeedbackModule {}
