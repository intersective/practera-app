import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { GoMobileComponent } from './go-mobile.component';
import { GoMobileService } from './go-mobile.service';
import { TextMaskModule } from 'angular2-text-mask';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    ReactiveFormsModule,
    TextMaskModule,
  ],
  declarations: [
    GoMobileComponent
  ],
  providers: [ GoMobileService ],
  exports: [
    GoMobileComponent,
  ]
})
export class GoMobileModule {}
