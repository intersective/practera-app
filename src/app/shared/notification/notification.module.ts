import { SharedModule } from '@shared/shared.module';
import { NgModule } from '@angular/core';
import { PopUpComponent } from './pop-up/pop-up.component';
import { AchievementPopUpComponent } from './achievement-pop-up/achievement-pop-up.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
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
    EventDetailComponent
  ],
  exports: [
    PopUpComponent,
    AchievementPopUpComponent,
    EventDetailComponent
  ],
  entryComponents: [
    PopUpComponent,
    AchievementPopUpComponent,
    EventDetailComponent
  ]
})

export class NotificationModule {

}
