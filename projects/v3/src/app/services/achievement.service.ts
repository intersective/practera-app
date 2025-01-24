import { ApolloService } from '@v3/services/apollo.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { RequestService } from 'request';
import { UtilsService } from '@v3/services/utils.service';
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
};

export interface Achievement {
  id: number;
  name: string;
  description: string;
  points?: number;
  image?: string;
  isEarned?: boolean;
  earnedDate?: string;
  type: string;
  badge: string;
  openBadge?: string;
  progress?: number;
  active?: boolean;
  certificateUrl?: string;
}

@Injectable({
  providedIn: "root",
})
export class AchievementService {
  private _achievements$ = new BehaviorSubject<Achievement[]>([]);
  achievements$ = this._achievements$.pipe(shareReplay(1));

  earnedPoints = 0;
  isPointsConfigured = false;

  constructor(
    private apolloService: ApolloService,
    private request: RequestService,
    private utils: UtilsService,
    private demo: DemoService
  ) {}

  /**
   * [graphQLGetAchievements description]
   * @link https://intersective.github.io/core-graphql-api/query.doc.html#:~:text=achievements(filter%3A%20String%2C%20type%3A%20String%2C%20active%3A%20Boolean)%3A%20%5BAchievement%5D
   * @return  {Observable<Achievement>[]}          achievement list in badges
   */
  graphQLGetAchievements(): Observable<Achievement[]> {
    return this.apolloService
      .graphQLFetch(
        `query achievements {
          achievements {
            id
            name
            description
            type
            badge
            openBadge
            points
            isEarned
            earnedDate
            progress
            active
            certificateUrl
          }
        }`
      )
      .pipe(
        map(
          (res: {
            data: {
              achievements: Achievement[];
            };
          }) => {
            return res?.data?.achievements || [];
          }
        )
      );
  }

  getAchievements() {
    if (environment.demo) {
      return setTimeout(
        () => this._achievements$.next(this.demo.achievements.data),
        1000
      );
    }

    return this.graphQLGetAchievements()
      .pipe(
        map((res: Achievement[]) => {
          const data = res;
          if (!Array.isArray(data)) {
            return this.request.apiResponseFormatError(
              "Achievement format error"
            );
          }
          if (!data.length) {
            this._achievements$.next([]);
            return [];
          }
          this.earnedPoints = 0;
          this.isPointsConfigured = false;
          const achievements: Achievement[] = [];
          data.forEach((achievement) => {
            if (
              !this.utils.has(achievement, "id") ||
              !this.utils.has(achievement, "name") ||
              !this.utils.has(achievement, "description") ||
              !this.utils.has(achievement, "badge") ||
              !this.utils.has(achievement, "points") ||
              !this.utils.has(achievement, "isEarned") ||
              !this.utils.has(achievement, "earnedDate")
            ) {
              return this.request.apiResponseFormatError(
                "Achievement object format error"
              );
            }
            achievements.push({
              id: achievement.id,
              name: achievement.name,
              description: achievement.description,
              points: +achievement.points,
              image: achievement.badge,
              isEarned: achievement.isEarned,
              earnedDate: achievement.earnedDate,
              type: achievement.type,
              badge: achievement.badge,
            });
            if (achievement.points > 0) {
              this.isPointsConfigured = true;
              if (achievement.isEarned) {
                this.earnedPoints += +achievement.points;
              }
            }
          });
          this._achievements$.next(achievements);
          return achievements;
        })
      )
      .subscribe();
  }

  getEarnedPoints() {
    return this.earnedPoints;
  }

  getIsPointsConfigured() {
    return this.isPointsConfigured;
  }
}
