import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { TabsRoutingModule } from './tabs-routing.module';
import { TabsComponent } from './tabs.component';

@NgModule({
  imports: [
    TabsRoutingModule,
    SharedModule
  ],
  declarations: [
    TabsComponent,
  ]
})
export class TabsModule {}
