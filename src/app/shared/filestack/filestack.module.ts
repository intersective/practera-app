import { IonicModule } from '@ionic/angular';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilestackService } from './filestack.service';
import { FilestackComponent } from './filestack.component';
import { PreviewComponent } from './preview/preview.component';

@NgModule({
  imports: [ 
    IonicModule,
    CommonModule 
  ],
  providers: [
    FilestackService
  ],
  declarations: [
    FilestackComponent,
    PreviewComponent
  ],
  exports: [
    FilestackComponent
  ],
  entryComponents: [
    PreviewComponent
  ]
})

export class FilestackModule {
  
}
