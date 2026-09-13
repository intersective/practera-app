import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { PersonalisedHeaderComponent } from './personalised-header.component';
import { SettingsPageModule } from '../pages/settings/settings.module';
import { NotificationsPageModule } from '../pages/notifications/notifications.module';
import { ComponentsModule } from '../components/components.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    SettingsPageModule,
    NotificationsPageModule,
    ComponentsModule,
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
