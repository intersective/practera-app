import { Component, Input, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AchievementsService, Achievement } from '@app/achievements/achievements.service';
import { NotificationService } from '@shared/notification/notification.service';
import { UtilsService } from '@services/utils.service';

/**
 * this is a achievement badge component
 */
@Component({
  selector: 'achievement-badge',
  templateUrl: './achievement-badge.component.html',
  styleUrls: ['./achievement-badge.component.scss']
})
export class AchievementBadgeComponent {

  @Input() achievement: Achievement;
  @Input() showName: Boolean = false;
  /**
    * @param {NotificationService} notificationService  the notification object
    * @param {UtilsService} utils  the utils object
    */
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private notificationService: NotificationService,
    public utils: UtilsService,
  ) {}

  currentActiveElement() {
    return this.document.activeElement;
  }

  /**
    * This is to pop up the achievement message box
    * @returns nothing
    */
  showAchievementDetails() {
    this.notificationService.achievementPopUp('', this.achievement, {
      activeElement: this.currentActiveElement()
    });
  }
}
