import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { PersonalisedHeaderComponent } from './personalised-header.component';
import { SettingsPageModule } from '../pages/settings/settings.module';
import { NotificationsComponent } from '../components/notifications/notifications.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    SettingsPageModule,
  ],
  declarations: [
    PersonalisedHeaderComponent,
    NotificationsComponent,
  ],
  exports: [
    PersonalisedHeaderComponent,
    NotificationsComponent,
  ]
})
export class PersonalisedHeaderModule {
}
