import { NgModule } from '@angular/core';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { ComponentsModule } from '../../components/components.module';
import { PersonalisedHeaderComponent } from '@v3/app/components/personalised-header/personalised-header.component';

@NgModule({
  imports: [
    IonicModule,
    ComponentsModule,
    HomePageRoutingModule
  ],
  declarations: [HomePage, PersonalisedHeaderComponent]
})
export class HomePageModule {}
