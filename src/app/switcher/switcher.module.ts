import { SharedModule } from '@shared/shared.module';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { NgCircleProgressModule } from 'ng-circle-progress';

import { SwitcherRoutingModule } from './switcher-routing.module';

import { SwitcherComponent } from './switcher.component';
import { SwitcherProgramComponent } from './switcher-program/switcher-program.component';

@NgModule({
  imports: [
    SharedModule,
    SwitcherRoutingModule,
    NgCircleProgressModule.forRoot({
      'outerStrokeLinecap': 'butt',
      'toFixed': 0,
      'outerStrokeColor': 'var(--ion-color-primary)',
      'backgroundColor': 'var(--ion-color-light)',
      'backgroundStroke': 'var(--ion-color-primary)',
      'showTitle': false,
      'showSubtitle': false,
      'startFromZero': false,
      'showInnerStroke': false,
      'showUnits': false,
      'backgroundStrokeWidth': 2,
      'maxPercent': 100,
      'outerStrokeWidth': 8,
      'radius': 4,
      'space': -20
    })
  ],
  declarations: [
    SwitcherComponent,
    SwitcherProgramComponent
  ]
})
export class SwitcherModule {}
