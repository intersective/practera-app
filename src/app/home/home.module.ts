import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { HomeComponent } from './home.component';
import { HomeRoutingComponent } from './home-routing.component';
import { HomeRoutingModule } from './home-routing.module';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { TodoCardComponent } from './todo-card/todo-card.component';
import { AchievementBadgeComponent } from '@shared/components/achievement-badge/achievement-badge.component';

@NgModule({
  imports: [
    SharedModule,
    NgCircleProgressModule.forRoot({
      "backgroundColor": "var(--ion-color-light)",
      "subtitleColor": "var(--ion-color-dark-tint)",
      "showInnerStroke": false,
      "startFromZero": false,
      "outerStrokeColor": "var(--ion-color-primary)",
      "innerStrokeColor": "var(--ion-color-primary)",
      "subtitle": [
        "COMPLETE"
      ],
      "animation": true,
      "animationDuration": 1000,
      "titleFontSize": "32",
      "subtitleFontSize": "18",
    }),
    HomeRoutingModule,
  ],
  declarations: [
    HomeComponent,
    HomeRoutingComponent,
    TodoCardComponent,
    AchievementBadgeComponent
  ],
})
export class HomeModule {
}
