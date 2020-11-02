import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreferenceComponent } from './preference.component';
import { PreferenceRoutingModule } from './preference-routing.module';

@NgModule({
  declarations: [PreferenceComponent],
  imports: [
    CommonModule,
    PreferenceRoutingModule
  ]
})
export class PreferenceModule { }
