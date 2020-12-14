import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { PreferenceComponent } from './preference.component';
import { PreferenceRoutingModule } from './preference-routing.module';
import { OptionsComponent } from './options/options.component';
import { PreferenceUpdateComponent } from './preference-update/preference-update.component';

@NgModule({
  declarations: [
    PreferenceComponent,
    OptionsComponent,
    PreferenceUpdateComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    PreferenceRoutingModule,
  ],
  exports: [
    SharedModule,
    CommonModule,
  ],
})
export class PreferenceModule { }
