import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsRoutingComponent } from './settings-routing.component';
import { SettingsComponent } from './settings.component';
import { SettingsRoutingModule } from './settings-routing.module';
import { TextMaskModule } from 'angular2-text-mask';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SettingsRoutingModule,     
    TextMaskModule
  ],
  declarations: [ 
    SettingsRoutingComponent, 
    SettingsComponent 
  ],
})
export class SettingsModule {}
