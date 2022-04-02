import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '@v3/app/components/components.module';
import { PersonalisedHeaderModule } from '@v3/app/personalised-header/personalised-header.module';

import { ActivityMobilePageRoutingModule } from './activity-mobile-routing.module';

import { ActivityMobilePage } from './activity-mobile.page';

@NgModule({
  imports: [
    ComponentsModule,
    IonicModule,
    ActivityMobilePageRoutingModule,
    PersonalisedHeaderModule,
  ],
  declarations: [ActivityMobilePage],
  exports: [ActivityMobilePage],
})
export class ActivityMobilePageModule {}
