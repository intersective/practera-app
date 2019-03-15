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

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    NgCircleProgressModule,
  ],
  declarations: [
    ActivityCardComponent,
    AchievementBadgeComponent,
    EventCardComponent,
    DescriptionComponent,
    ClickableItemComponent,
    CircleProgressComponent
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
    NgCircleProgressModule
  ],
})
export class SharedModule {}
