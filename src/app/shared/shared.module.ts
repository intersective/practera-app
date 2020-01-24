import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivityCardComponent } from '@shared/components/activity-card/activity-card.component';
import { AchievementBadgeComponent } from '@shared/components/achievement-badge/achievement-badge.component';
import { EventCardComponent } from '@shared/components/event-card/event-card.component';
import { DescriptionComponent } from '@shared/components/description/description.component';
import { ClickableItemComponent } from '@shared/components/clickable-item/clickable-item.component';
import { CircleProgressComponent } from '@shared/components/circle-progress/circle-progress.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { BrandingLogoComponent } from '@shared/components/branding-logo/branding-logo.component';
import { ContactNumberFormComponent } from '@shared/components/contact-number-form/contact-number-form.component';
import { ListItemComponent } from '@shared/components/list-item/list-item.component';

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
    EventCardComponent,
    DescriptionComponent,
    ClickableItemComponent,
    CircleProgressComponent,
    BrandingLogoComponent,
    ContactNumberFormComponent,
    ListItemComponent,
  ],
  exports: [
    ActivityCardComponent,
    AchievementBadgeComponent,
    EventCardComponent,
    DescriptionComponent,
    ClickableItemComponent,
    CircleProgressComponent,
    IonicModule,
    CommonModule,
    FormsModule,
    BrandingLogoComponent,
    ContactNumberFormComponent,
    ListItemComponent,
  ],
})
export class SharedModule {}
