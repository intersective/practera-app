import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { PathCardComponent } from '@shared/components/path-card/path-card.component';
import { ActivityCardComponent } from '@shared/components/activity-card/activity-card.component';
import { AchievementBadgeComponent } from '@shared/components/achievement-badge/achievement-badge.component';
import { EventCardComponent } from '@shared/components/event-card/event-card.component';
import { DescriptionComponent } from '@shared/components/description/description.component';
import { ClickableItemComponent } from '@shared/components/clickable-item/clickable-item.component';
import { NgCircleProgressModule } from 'ng-circle-progress';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    NgCircleProgressModule.forRoot({
      'outerStrokeLinecap': 'butt',
      'toFixed': 0,
      'outerStrokeColor': 'var(--ion-color-primary)',
      'backgroundColor': 'var(--ion-color-light)',
      'backgroundStroke': 'var(--ion-color-primary)',
      'showTitle': false,
      'showSubtitle': false,
      'startFromZero': false,
      'showInnerStroke': false,
      'showUnits': false,
      'backgroundStrokeWidth': 2,
      'maxPercent': 100,
      'outerStrokeWidth': 8,
      'radius': 4,
      'space': -20
    })
  ],
  declarations: [
    PathCardComponent,
    ActivityCardComponent,
    AchievementBadgeComponent,
    EventCardComponent,
    DescriptionComponent,
    ClickableItemComponent
  ],
  exports: [
    PathCardComponent,
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
