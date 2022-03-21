import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '@v3/app/components/components.module';

import { ActivityDesktopPageRoutingModule } from './activity-desktop-routing.module';

import { ActivityDesktopPage } from './activity-desktop.page';

@NgModule({
  imports: [
    ComponentsModule,
    IonicModule,
    ActivityDesktopPageRoutingModule
  ],
  declarations: [ActivityDesktopPage],
  exports: [ActivityDesktopPage],
})
export class ActivityDesktopPageModule {}
