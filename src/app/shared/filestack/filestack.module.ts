import { ModuleWithProviders, NgModule } from '@angular/core';
import { FilestackService } from './filestack.service';
import { SharedModule } from '@shared/shared.module';
import { FilestackComponent } from './filestack.component';
import { PreviewComponent } from './preview/preview.component';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  imports: [
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
