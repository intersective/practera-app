import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './home.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { CoreModule } from '../core/core.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    CoreModule,
    NgCircleProgressModule.forRoot({
      "backgroundColor": "var(--ion-color-light)",
      "subtitleColor": "var(--ion-color-dark-tint)",
      "showInnerStroke": false,
      "startFromZero": false,
      "outerStrokeColor": "var(--ion-color-primary)",
      "subtitle": [
        "COMPLETE"
      ],
      "animation": true,
      "animationDuration": 1000,
      "titleFontSize": "32",
      "subtitleFontSize": "18",
    }),
    RouterModule.forChild([{ path: '', component: HomeComponent }])

  ],
  declarations: [HomeComponent],
  exports: [
    CommonModule,
    FormsModule,
    CoreModule,
  ],
})
export class HomeModule {
}
