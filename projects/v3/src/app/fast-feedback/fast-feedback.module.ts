import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FastFeedbackComponent } from '../components/fast-feedback/fast-feedback.component';

@NgModule({
  declarations: [
    FastFeedbackComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    FastFeedbackComponent
  ]
})
export class FastFeedbackModule { }
