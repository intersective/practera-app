import { Component, Input, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AchievementsService, Achievement } from './achievements.service';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { RouterEnter } from '@services/router-enter.service';

@Component({
  selector: 'app-achievements',
  templateUrl: 'achievements.component.html',
  styleUrls: ['achievements.component.scss']
})
export class AchievementsComponent extends RouterEnter {
  routeUrl = '/achievements';
  achievements: Array<Achievement>;
  loadingAchievements = true;
  userInfo = {
    image: '',
    name: ''
  };

  constructor (
    public router: Router,
    public achievementService: AchievementsService,
    public utils: UtilsService,
    private ngZone: NgZone,
    private newRelic: NewRelicService,
    public storage: BrowserStorageService,
  ) {
    super(router);
  }

  onEnter() {
    this.userInfo = {
      image: this.storage.get('me').image,
      name: this.storage.get('me').name
    };
    this.loadingAchievements = true;
    this.achievementService.getAchievements().subscribe(
      achievements => {
        this.achievements = achievements;
        this.loadingAchievements = false;
      },
      err => {
        this.newRelic.noticeError(`${JSON.stringify(err)}`);
      }
    );
  }

  back() {
    return this.ngZone.run(() => this.router.navigate(['app', 'home']));
  }
}
