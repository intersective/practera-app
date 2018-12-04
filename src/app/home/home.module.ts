import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './home.component';
import { ActivityCardModule } from '../components/activity-card/activity-card.module';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { TodoCardComponent } from '../components/todo-card/todo-card.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ActivityCardModule,
    NgCircleProgressModule.forRoot({
      // set defaults here
      "backgroundColor": "#f5f6fa",
      "backgroundPadding": -10,
      "radius": 70,
      "maxPercent": 100,
      "outerStrokeWidth": 12,
      "outerStrokeColor": "var(--ion-color-primary)",
      "innerStrokeWidth": 0,
      "subtitleColor": "#444444",
      "showInnerStroke": false,
      "startFromZero": false,
      "subtitle": [
        "COMPLETE"
      ],
      "animation": true,
      "animationDuration": 1000,
      "titleFontSize": "32",
      "subtitleFontSize": "18",
    })
  ],
  declarations: [HomeComponent, TodoCardComponent]
})
export class HomeModule {
}
