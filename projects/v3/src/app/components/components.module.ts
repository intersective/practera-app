import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { DescriptionComponent } from './description/description.component';
import { ListItemComponent } from './list-item/list-item.component';
import { CircleProgressComponent } from './circle-progress/circle-progress.component';
import { NgCircleProgressModule } from 'ng-circle-progress';

const largeCircleDefaultConfig = {
  backgroundColor: 'var(--ion-color-light)',
  subtitleColor: 'var(--ion-color-dark-tint)',
  showInnerStroke: false,
  startFromZero: false,
  outerStrokeColor: 'var(--ion-color-primary)',
  innerStrokeColor: 'var(--ion-color-primary)',
  subtitle: [
    'COMPLETE'
  ],
  animation: true,
  animationDuration: 1000,
  titleFontSize: '32',
  subtitleFontSize: '18',
};
@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    NgCircleProgressModule.forRoot(largeCircleDefaultConfig),
  ],
  declarations: [
    DescriptionComponent,
    ListItemComponent,
    CircleProgressComponent,
  ],
  exports: [
    DescriptionComponent,
    ListItemComponent,
    CircleProgressComponent,
    IonicModule,
    CommonModule,
    FormsModule,
  ],
})
export class ComponentsModule {}
