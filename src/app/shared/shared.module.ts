import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivityCardComponent } from '@shared/components/activity-card/activity-card.component';
import { AchievementBadgeComponent } from '@shared/components/achievement-badge/achievement-badge.component';
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
    DescriptionComponent
  ],
  exports: [
    ActivityCardComponent,
    AchievementBadgeComponent,
    DescriptionComponent,
    IonicModule,
    CommonModule,
  ],
})
export class SharedModule {}
