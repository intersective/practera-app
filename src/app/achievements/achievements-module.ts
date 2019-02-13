import { SharedModule } from '@shared/shared.module';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AchievementsRoutingModule } from './achievements-routing.module';
import { AchievementsComponent } from './achievements.component';

@NgModule({
  imports: [
    SharedModule,
    AchievementsRoutingModule,
  ],
  declarations: [
    AchievementsComponent
  ]
})

export class AchievementsModule {
}
