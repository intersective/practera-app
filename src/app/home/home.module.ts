import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './home.component';
import { ActivityCardComponent } from '../components/activity-card/activity-card.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { FeedbackComponent } from '../components/feedback/feedback.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    NgCircleProgressModule.forRoot({
      // set defaults here
      "backgroundColor": "#f5f6fa",
      "backgroundPadding": -10,
      "radius": 60,
      "maxPercent": 100,
      "outerStrokeWidth": 10,
      "outerStrokeColor": "#2bbfd4",
      "innerStrokeWidth": 0,
      "subtitleColor": "#444444",
      "showInnerStroke": false,
      "startFromZero": false,
      "subtitle": [
        "COMPLETE"
      ],
      "animationDuration": 1000,
      "titleFontSize": "32",
      "subtitleFontSize": "18",
    }),
    
    RouterModule.forChild([{ path: '', component: HomeComponent }])
  ],
  declarations: [HomeComponent, ActivityCardComponent, FeedbackComponent],
 
})
export class HomeModule {
}
