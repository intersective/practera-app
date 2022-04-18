import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { PersonalisedHeaderComponent } from './personalised-header.component';
import { SettingsPageModule } from '../pages/settings/settings.module';
import { NotificationsComponent } from '../components/notifications/notifications.component';
import { NotificationsPageModule } from '../pages/notifications/notifications.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    SettingsPageModule,
    NotificationsPageModule,
  ],
  declarations: [
    PersonalisedHeaderComponent,
  ],
  exports: [
    PersonalisedHeaderComponent,
  ]
})
export class PersonalisedHeaderModule {
}
