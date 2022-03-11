import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { DescriptionComponent } from './description/description.component';
import { ListItemComponent } from './list-item/list-item.component';
import { ImgComponent } from './img/img.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
  ],
  declarations: [
    DescriptionComponent,
    ListItemComponent,
    ImgComponent,
  ],
  exports: [
    DescriptionComponent,
    ListItemComponent,
    IonicModule,
    CommonModule,
    FormsModule,
    ImgComponent,
  ],
})
export class ComponentsModule {}
