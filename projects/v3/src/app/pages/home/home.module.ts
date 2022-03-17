import { NgModule } from '@angular/core';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { ComponentsModule } from '../../components/components.module';
import { PersonalisedHeaderModule } from '@v3/app/personalised-header/personalised-header.module';

@NgModule({
  imports: [
    ComponentsModule,
    HomePageRoutingModule,
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
