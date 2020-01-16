import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { SettingsRoutingComponent } from './settings-routing.component';
import { SettingsComponent } from './settings.component';
import { SettingsRoutingModule } from './settings-routing.module';
import { TextMaskModule } from 'angular2-text-mask';
import { FilestackModule } from '@shared/filestack/filestack.module';
import { FastFeedbackModule } from '../fast-feedback/fast-feedback.module';

@NgModule({
  imports: [
    SharedModule,
    SettingsRoutingModule,
    TextMaskModule,
    FilestackModule,
    FastFeedbackModule
  ],
  declarations: [
    SettingsRoutingComponent,
    SettingsComponent
  ],
  exports: [
    SharedModule,
    FilestackModule,
    FastFeedbackModule
  ]
})
export class SettingsModule {}
