import { SharedModule } from '@shared/shared.module';
import { NgModule } from '@angular/core';
import { PopUpComponent } from './pop-up/pop-up.component';
import { AchievementPopUpComponent } from './achievement-pop-up/achievement-pop-up.component';
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
    AchievementPopUpComponent
  ],
  exports: [
    PopUpComponent,
    AchievementPopUpComponent
  ],
  entryComponents: [
    PopUpComponent,
    AchievementPopUpComponent
  ]
})

export class NotificationModule {

}
