import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AchievementsService, Achievements } from './achievements.service';
import { UtilsService } from '../services/utils.service';
import { RouterEnter } from '@services/router-enter.service';

@Component({
  selector: 'app-achievements',
  templateUrl: 'achievements.component.html',
  styleUrls: ['achievements.component.scss']
})
export class AchievementsComponent extends RouterEnter {

}
