import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { H5pComponent } from './h5p/h5p.component';
import { IonicModule } from '@ionic/angular';
import { H5PPage } from './h5p.page';
import { H5PPageRoutingModule } from './h5p-routing.module';

@NgModule({
  declarations: [
    H5pComponent,
    H5PPage
  ],
  imports: [
    IonicModule,
    CommonModule,
    H5PPageRoutingModule
  ],
  exports: [
    H5pComponent
  ]
})
export class H5pModule { }
