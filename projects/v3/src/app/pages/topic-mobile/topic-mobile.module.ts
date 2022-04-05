import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '@v3/app/components/components.module';
import { PersonalisedHeaderModule } from '@v3/app/personalised-header/personalised-header.module';

import { TopicMobilePageRoutingModule } from './topic-mobile-routing.module';

import { TopicMobilePage } from './topic-mobile.page';

@NgModule({
  imports: [
    ComponentsModule,
    IonicModule,
    TopicMobilePageRoutingModule,
    PersonalisedHeaderModule,
  ],
  declarations: [TopicMobilePage],
  exports: [TopicMobilePage],
})
export class TopicMobilePageModule {}
