import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivityCardComponent } from '@shared/components/activity-card/activity-card.component';
import { AchievementBadgeComponent } from '@shared/components/achievement-badge/achievement-badge.component';
import { EventCardComponent } from '@shared/components/event-card/event-card.component';
import { DescriptionComponent } from '@shared/components/description/description.component';
import { ClickableItemComponent } from '@shared/components/clickable-item/clickable-item.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  declarations: [
    ActivityCardComponent,
    AchievementBadgeComponent,
    EventCardComponent,
    DescriptionComponent,
    ClickableItemComponent
  ],
  exports: [
    ActivityCardComponent,
    AchievementBadgeComponent,
    EventCardComponent,
    DescriptionComponent,
    ClickableItemComponent,
    IonicModule,
    CommonModule,
    FormsModule
  ],
})
export class SharedModule {}
