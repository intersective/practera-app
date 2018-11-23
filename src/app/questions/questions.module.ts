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
import { QFileComponent } from './q-file/q-file.component';
import { QFileDisplayComponent } from './q-file/q-file-display/q-file-display.component';
import { FilestackModule } from '@shared/filestack/filestack.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FilestackModule
  ],
  declarations: [
    QuestionsComponent,
    QTextComponent,
    QOneofComponent,
    QMultipleComponent,
    QFileComponent,
    QFileDisplayComponent
  ],
  exports: [
    QTextComponent,
    QOneofComponent,
    QMultipleComponent,
    QFileComponent
  ]
 
})
export class QuestionsModule {
}
