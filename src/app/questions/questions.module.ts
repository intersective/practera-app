import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { QuestionsComponent } from './questions.component';
import { QTextComponent } from './q-text/q-text.component';
import { QOneofComponent } from './q-oneof/q-oneof.component';
import { QMultipleComponent } from './q-multiple/q-multiple.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    QuestionsComponent,
    QTextComponent,
    QOneofComponent,
    QMultipleComponent
  ],
  exports: [
    QTextComponent,
    QOneofComponent,
    QMultipleComponent
  ]
 
})
export class QuestionsModule {
}
