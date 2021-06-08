import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { SettingsEmbedRoutingComponent } from './settings-embed-routing.component';
import { SettingsComponent } from '../settings/settings.component';
import { SettingsEmbedRoutingModule } from './settings-embed-routing.module';
import { TextMaskModule } from 'angular2-text-mask';
import { FilestackModule } from '@shared/filestack/filestack.module';

@NgModule({
  imports: [
    SharedModule,
    SettingsEmbedRoutingModule,
    TextMaskModule,
    FilestackModule,
  ],
  declarations: [
    SettingsEmbedRoutingComponent,
    SettingsComponent
  ],
  exports: [
    SharedModule,
    FilestackModule,
  ]
})
export class SettingsEmbedModule {}
