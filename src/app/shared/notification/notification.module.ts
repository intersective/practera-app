import { SharedModule } from '@shared/shared.module';
import { NgModule } from '@angular/core';
import { PopUpComponent } from './pop-up/pop-up.component';
import { AchievementPopUpComponent } from './achievement-pop-up/achievement-pop-up.component';
import { LockTeamAssessmentPopUpComponent } from './lock-team-assessment-pop-up/lock-team-assessment-pop-up.component';
import { NotificationService } from './notification.service';
import { CustomToastComponent } from './custom-toast/custom-toast.component';


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
    LockTeamAssessmentPopUpComponent,
    CustomToastComponent
  ],
  exports: [
    PopUpComponent,
    AchievementPopUpComponent,
    LockTeamAssessmentPopUpComponent,
    CustomToastComponent
  ],
  entryComponents: [
    PopUpComponent,
    AchievementPopUpComponent,
    LockTeamAssessmentPopUpComponent,
    CustomToastComponent
  ]
})

export class NotificationModule {

}
