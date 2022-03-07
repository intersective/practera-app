import { NgModule } from '@angular/core';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    IonicModule,
    ComponentsModule,
    HomePageRoutingModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
