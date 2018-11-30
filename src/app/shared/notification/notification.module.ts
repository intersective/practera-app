import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopUpComponent } from './pop-up/pop-up.component';
import { NotificationService } from './notification.service';

@NgModule({
  imports: [ 
    IonicModule,
    CommonModule 
  ],
  providers: [
    NotificationService
  ],
  declarations: [
    PopUpComponent
  ],
  exports: [
    PopUpComponent
  ]
})

export class NotificationModule {
  
}
