import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionsComponent } from './questions.component';
import { QTextComponent } from './q-text/q-text.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  declarations: [
    QuestionsComponent,
    QTextComponent
  ],
  exports: [
    QTextComponent
  ]
 
})
export class QuestionsModule {
}
