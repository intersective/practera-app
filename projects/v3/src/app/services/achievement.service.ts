import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestService } from 'request';
import { UtilsService } from '@v3/services/utils.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { DemoService } from './demo.service';
import { environment } from '@v3/environments/environment';

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
    todoItem: 'api/v2/motivations/todo_item/edit.json'
  }
};

export interface Achievement {
  id: number;
  name: string;
  description: string;
  points?: number;
  image?: string;
  isEarned?: boolean;
  earnedDate?: string;
}

@Injectable({
  providedIn: 'root'
})

export class AchievementService {
  private _achievements$ = new BehaviorSubject<Achievement[]>([]);
  achievements$ = this._achievements$.asObservable();

  constructor(
    private request: RequestService,
    private utils: UtilsService,
    private storage: BrowserStorageService,
    private demo: DemoService
  ) { }

  getAchievements(order?) {
    if (environment.demo) {
      return setTimeout(() => this._achievements$.next(this.demo.achievements.data), 1000);
    }
    if (!order) {
      order = 'asc';
    }
    return this.request.get(api.get.achievements, {
      params: {
        order: order
      }
    })
      .pipe(map((res: any) => {
        const data = res.data;
        if (!Array.isArray(data)) {
          return this.request.apiResponseFormatError('Achievement format error');
        }
        if (!data.length) {
          this._achievements$.next([]);
          return [];
        }
        const achievements: Array<Achievement> = [];
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
            points: +achievement.points,
            image: achievement.badge,
            isEarned: achievement.isEarned,
            earnedDate: achievement.earnedDate,
          });
        });
        this._achievements$.next(achievements);
        return achievements;
      })
      ).subscribe();
  }

  markAchievementAsSeen(achievementId) {
    if (environment.demo) {
      return this.demo.normalResponse();
    }
    const postData = {
      project_id: this.storage.getUser().projectId,
      identifier: 'Achievement-' + achievementId,
      is_done: true
    };
    return this.request.post(
      {
        endPoint: api.post.todoItem,
        data: postData
      }
    ).subscribe();
  }
}
