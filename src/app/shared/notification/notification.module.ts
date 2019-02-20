import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopUpComponent } from './pop-up/pop-up.component';
import { AchievementPopUpComponent } from './achievement-pop-up/achievement-pop-up.component';
import { NotificationService } from './notification.service';


@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
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
