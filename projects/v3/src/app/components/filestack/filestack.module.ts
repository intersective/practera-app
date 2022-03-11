import { NgModule } from '@angular/core';
import { FilestackService } from './filestack.service';
import { ComponentsModule } from '../components.module';
import { FilestackComponent } from './filestack.component';
import { PreviewComponent } from './preview/preview.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    HttpClientModule,
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
  ],
})

export class FilestackModule {

}
