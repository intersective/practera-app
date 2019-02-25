import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivityCardComponent } from '@shared/components/activity-card/activity-card.component';
import { AchievementBadgeComponent } from '@shared/components/achievement-badge/achievement-badge.component';
import { EventListComponent } from '@shared/components/event-list/event-list.component';
import { DescriptionComponent } from '@shared/components/description/description.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  declarations: [
    ActivityCardComponent,
    AchievementBadgeComponent,
    EventListComponent,
    DescriptionComponent
  ],
  exports: [
    ActivityCardComponent,
    AchievementBadgeComponent,
    EventListComponent,
    DescriptionComponent,
    IonicModule,
    CommonModule,
  ],
})
export class SharedModule {}
