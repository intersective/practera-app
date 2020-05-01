import { IonicModule } from '@ionic/angular';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilestackService } from './filestack.service';
import { SharedModule } from '@shared/shared.module';
import { FilestackComponent } from './filestack.component';
import { PreviewComponent } from './preview/preview.component';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    HttpClientModule,
    SharedModule
  ],
  providers: [
    FilestackService
  ],
  declarations: [
    FilestackComponent,
    PreviewComponent,
  ],
  exports: [
    FilestackComponent,
    HttpClientModule,
    SharedModule
  ],
  entryComponents: [
    PreviewComponent,
  ]
})

export class FilestackModule {

}
