import { SharedModule } from '@shared/shared.module';
import { NgModule } from '@angular/core';
import { PopUpComponent } from './pop-up/pop-up.component';
import { AchievementPopUpComponent } from './achievement-pop-up/achievement-pop-up.component';
import { LockTeamAssessmentPopUpComponent } from './lock-team-assessment-pop-up/lock-team-assessment-pop-up.component';
import { NotificationService } from './notification.service';


@NgModule({
  imports: [
    SharedModule
  ],
  providers: [
    NotificationService
  ],
  declarations: [
    PopUpComponent,
    AchievementPopUpComponent,
    LockTeamAssessmentPopUpComponent
  ],
  exports: [
    PopUpComponent,
    AchievementPopUpComponent,
    LockTeamAssessmentPopUpComponent
  ],
  entryComponents: [
    PopUpComponent,
    AchievementPopUpComponent,
    LockTeamAssessmentPopUpComponent
  ]
})

export class NotificationModule {

}
