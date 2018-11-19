import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HelpComponent } from './help.component';
import { SettingComponent } from './setting/setting.component';
import { HelpRoutingModule } from './help-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HelpRoutingModule,
  ],
  declarations: [ HelpComponent, SettingComponent ],
})
export class HelpModule {}
