import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';

/**
 * @name api
 * @description list of api endpoint involved in this service
 * @type {Object}
 */
const api = {
  get: {
    achievements: 'api/v2/motivations/achievement/list.json'
  },
  post: {
  }
};

export interface Achievement {
  id: number;
  name: string;
  description: string;
  points?: number;
  image?: string;
  isEarned: boolean;
  earnedDate?: string;
}

@Injectable({
  providedIn: 'root'
})

export class AchievementsService {

  constructor(
    private request: RequestService,
    private utils: UtilsService,
  ) {}

  getAchievements(order?): Observable<any> {
    if (!order) {
      order = 'asc';
    }
    return this.request.get(api.get.achievements, {params: {
        order: order
      }})
      .pipe(map(response => {
        return this._normaliseAchievements(response.data);
      })
    );
  }

  private _normaliseAchievements(data) {
    if (!Array.isArray(data)) {
      return this.request.apiResponseFormatError('Achievement format error');
    }
    let achievements: Array<Achievement> = [];
    data.forEach(achievement => {
      if (!this.utils.has(achievement, 'id') ||
          !this.utils.has(achievement, 'name') ||
          !this.utils.has(achievement, 'description') ||
          !this.utils.has(achievement, 'badge') ||
          !this.utils.has(achievement, 'points') ||
          !this.utils.has(achievement, 'isEarned') ||
          !this.utils.has(achievement, 'earnedDate')) {
        return this.request.apiResponseFormatError('Achievement object format error');
      }
      achievements.push({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        points: achievement.points,
        image: achievement.badge,
        isEarned: achievement.isEarned,
        earnedDate: achievement.earnedDate,
      });
    });
    return achievements;
  }
}


