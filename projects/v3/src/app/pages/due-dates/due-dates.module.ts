import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DueDatesComponent } from './due-dates.component';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { PersonalisedHeaderModule } from '@v3/app/personalised-header/personalised-header.module';

@NgModule({
  declarations: [
    DueDatesComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: DueDatesComponent,
      },
    ]),
  ],
})
export class DueDatesModule { }
