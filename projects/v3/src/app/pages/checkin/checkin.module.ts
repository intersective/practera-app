import { NgModule } from '@angular/core';
import { CheckinPage } from './checkin.page';
import { CheckinRoutingModule } from './checkin-routing.module';
import { ComponentsModule } from '@v3/app/components/components.module';

@NgModule({
  imports: [
    ComponentsModule,
    CheckinRoutingModule,
  ],
  declarations: [CheckinPage],
})
export class CheckinModule {}
