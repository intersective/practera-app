import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { SettingsRoutingComponent } from './settings-routing.component';
import { SettingsComponent } from './settings.component';
import { SettingsRoutingModule } from './settings-routing.module';
import { TextMaskModule } from 'angular2-text-mask';
import { FilestackModule } from '@shared/filestack/filestack.module';

@NgModule({
  imports: [
    SharedModule,
    SettingsRoutingModule,
    TextMaskModule,
    FilestackModule
  ],
  declarations: [
    SettingsRoutingComponent,
    SettingsComponent
  ],
})
export class SettingsModule {}
