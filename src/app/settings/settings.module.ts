import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsRoutingComponent } from './settings-routing.component';
import { SettingsComponent } from './settings.component';
import { SettingsRoutingModule } from './settings-routing.module';
import {NgxMaskModule} from 'ngx-mask'

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SettingsRoutingModule,
    NgxMaskModule.forRoot()
  ],
  declarations: [ 
    SettingsRoutingComponent, 
    SettingsComponent 
  ],
})
export class SettingsModule {}
