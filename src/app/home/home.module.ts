import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './home.component';
import { ActivityCardComponent } from '../components/activity-card/activity-card.component';
import { NgCircleProgressModule } from 'ng-circle-progress';

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
      "maxPercent": 80,
      "outerStrokeWidth": 10,
      "outerStrokeColor": "#2bbfd4",
      "innerStrokeWidth": 0,
      "subtitleColor": "#444444",
      "showInnerStroke": false,
      "startFromZero": false
    
    }),
    
    RouterModule.forChild([{ path: '', component: HomeComponent }])
  ],
  declarations: [HomeComponent, ActivityCardComponent],
 
})
export class HomeModule {
}
