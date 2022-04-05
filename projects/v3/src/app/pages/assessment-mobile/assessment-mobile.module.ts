import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '@v3/app/components/components.module';
import { PersonalisedHeaderModule } from '@v3/app/personalised-header/personalised-header.module';

import { AssessmentMobilePageRoutingModule } from './assessment-mobile-routing.module';

import { AssessmentMobilePage } from './assessment-mobile.page';

@NgModule({
  imports: [
    ComponentsModule,
    IonicModule,
    AssessmentMobilePageRoutingModule,
    PersonalisedHeaderModule,
  ],
  declarations: [AssessmentMobilePage],
  exports: [AssessmentMobilePage],
})
export class AssessmentMobilePageModule {}
