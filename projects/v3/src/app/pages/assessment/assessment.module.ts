import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AssessmentPageRoutingModule } from './assessment-routing.module';

import { AssessmentPage } from './assessment.page';
import { ComponentsModule } from '@v3/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssessmentPageRoutingModule,
    ComponentsModule,
  ],
  declarations: [AssessmentPage]
})
export class AssessmentPageModule {}
