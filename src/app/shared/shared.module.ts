import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivityCardComponent } from '@shared/components/activity-card/activity-card.component';
import { AchievementBadgeComponent } from '@shared/components/achievement-badge/achievement-badge.component';
import { DescriptionComponent } from '@shared/components/description/description.component';
import { ClickableItemComponent } from '@shared/components/clickable-item/clickable-item.component';
import { CircleProgressComponent } from '@shared/components/circle-progress/circle-progress.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { BrandingLogoComponent } from '@shared/components/branding-logo/branding-logo.component';
import { ContactNumberFormComponent } from '@shared/components/contact-number-form/contact-number-form.component';
import { ListItemComponent } from '@shared/components/list-item/list-item.component';
import { FloatDirective } from './directives/float/float.directive';
import { ImgComponent } from '@shared/components/img/img.component';
import { DragAndDropDirective } from './directives/drag-and-drop/drag-and-drop.directive';

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
    ActivityCardComponent,
    AchievementBadgeComponent,
    DescriptionComponent,
    ClickableItemComponent,
    CircleProgressComponent,
    BrandingLogoComponent,
    ContactNumberFormComponent,
    ListItemComponent,
    FloatDirective,
    DragAndDropDirective,
    ImgComponent,
  ],
  exports: [
    ActivityCardComponent,
    AchievementBadgeComponent,
    DescriptionComponent,
    ClickableItemComponent,
    CircleProgressComponent,
    IonicModule,
    CommonModule,
    FormsModule,
    BrandingLogoComponent,
    ContactNumberFormComponent,
    ListItemComponent,
    FloatDirective,
    ImgComponent,
    DragAndDropDirective
  ],
})
export class SharedModule {}
