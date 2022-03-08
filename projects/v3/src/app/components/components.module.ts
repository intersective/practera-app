import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { DescriptionComponent } from './description/description.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
  ],
  declarations: [
    DescriptionComponent,
  ],
  exports: [
    DescriptionComponent,
    IonicModule,
    CommonModule,
    FormsModule,
  ],
})
export class ComponentsModule {}
