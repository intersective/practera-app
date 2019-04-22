import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoMobileComponent } from './go-mobile.component';
import { GoMobileService } from './go-mobile.service';
import { TextMaskModule } from 'angular2-text-mask';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TextMaskModule,
    SharedModule
  ],
  declarations: [
    GoMobileComponent
  ],
  providers: [ GoMobileService ],
  exports: [
    GoMobileComponent,
    FormsModule,
  ]
})
export class GoMobileModule {}
