import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ProjectComponent } from './project.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { ProjectService } from './project.service';
import { ProjectRoutingComponent } from './project-routing.component';
import { ProjectRoutingModule } from './project-routing.module';
import { SharedModule } from '@shared/shared.module';
import { FastFeedbackModule } from '../fast-feedback/fast-feedback.module';

@NgModule({
  imports: [
    SharedModule,
    ProjectRoutingModule,
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
    }),
    FastFeedbackModule
  ],
  declarations: [
    ProjectComponent,
    ProjectRoutingComponent
  ],
  providers: [
    ProjectService,
  ],
  exports: [
    SharedModule,
    FastFeedbackModule
  ]
})
export class ProjectModule {}
