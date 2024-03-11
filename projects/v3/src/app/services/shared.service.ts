import { Injectable } from '@angular/core';
import { UtilsService } from '@v3/services/utils.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { NotificationsService } from './notifications.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { TopicService } from '@v3/services/topic.service';
import { ApolloService } from '@v3/services/apollo.service';
import { PusherService } from '@v3/services/pusher.service';
import { first, map } from 'rxjs/operators';
import { AchievementService } from './achievement.service';
import { RequestService } from 'request';

/**
 * @name api
 * @description list of api endpoint involved in this service
 * @type {Object}
 */
const api = {
  get: {
    jwt: 'api/v2/users/jwt/refresh.json'
  }
};

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private achievementEvent;

  private _team$ = new BehaviorSubject<any>(null);
  public team$ = this._team$.asObservable();

  constructor(
    private utils: UtilsService,
    private storage: BrowserStorageService,
    private notification: NotificationsService,
    private http: HttpClient,
    private requestService: RequestService,
    private topicService: TopicService,
    private apolloService: ApolloService,
    private pusherService: PusherService,
    private achievementService: AchievementService,
  ) { }

  // call this function on every page refresh and after switch program
  onPageLoad(): void {
    this.getIpLocation();
    const {
      timelineId,
      colors,
      activityCardImage,
    } = this.storage.getUser();

    // only do these if a timeline is choosen
    if (!timelineId) {
      return;
    }
    // check and change theme color on every page refresh
    if (colors) {
      this.utils.changeThemeColor(colors);
    }
    const image = activityCardImage;
    if (image) {
      this.utils.changeCardBackgroundImage(image);
    }

    // subscribe to the achievement event if it is not subscribed
    if (!this.achievementEvent) {
      this.achievementEvent = this.utils.getEvent('achievement').subscribe(event => {
        if (event?.meta?.Achievement) {
          const { id, name, description, points, badge } = event.meta.Achievement;
          this.notification.achievementPopUp('notification', {
            id,
            name,
            description,
            points,
            image: badge
          });
          this.achievementService.getAchievements();
        }

        // refresh todoItems
        if (event?.event === 'achievement') {
          this.notification.getTodoItems().pipe(first()).subscribe();
        }
      });
    }
  }

  /**
   * @name getTeamInfo
   * @description pull team information which belongs to current user
   *              (determined by header data in the api request)
   *
   * @return  {Observable<any>} non-strict return value, we won't use
   *                            this return value anywhere.
   */
  getTeamInfo(): Observable<any> {
    return this.apolloService.graphQLFetch(
      `query user {
        user {
          teams {
              id
              name
          }
        }
      }`
    ).pipe(map(async response => {
      if (response?.data?.user) {
        const thisUser = response.data.user;
        const newTeamId = thisUser.teams.length > 0 ? thisUser.teams[0].id : null;

        // get latest JWT if teamId changed
        if (this.storage.getUser().teamId !== newTeamId) {
          await this.refreshJWT();
        }

        if (!this.utils.has(thisUser, 'teams') ||
          !Array.isArray(thisUser.teams) ||
          !this.utils.has(thisUser.teams[0], 'id')
        ) {
          this.storage.setUser({
            teamId: null
          });
        }

        if (thisUser.teams.length > 0) {
          this.storage.setUser({
            teamId: thisUser.teams[0].id,
            teamName: thisUser.teams[0].name
          });
        }
      }
      return response;
    }));
  }

  /**
   * This method check due dates of assessment or activity.
   * - Check due date is today, tomorrow, upcoming date or overdue date.
   * - If due date is upcoming one this will returns 'Due (date)' ex: 'Due 06-30-2019'.
   * - If due date is overdue one this will returns 'Overdue (date)' ex: 'Overdue 01-10-2019'.
   * - If due date is today this will return 'Due Today'.
   * - If due date is tomorrow this will return 'Due Tomorrow'.
   * @param dueDate - due date of assessment or activity.
   */
  dueDateFormatter(dueDate: string) {
    if (!dueDate) {
      return '';
    }
    const difference = this.utils.timeComparer(dueDate);
    if (difference < 0) {
      return $localize`Overdue ${this.utils.utcToLocal(dueDate)}`;
    }
    return $localize`Due ${this.utils.utcToLocal(dueDate)}`;
  }

  /**
   * This method get all iframe and videos from documents and stop playing videos.
   */
  stopPlayingVideos() {
    const iframes = Array.from(document.querySelectorAll('iframe'));
    const videos = Array.from(document.querySelectorAll('video'));
    if (iframes) {
      iframes.forEach(frame => {
        frame.src = null;
      });
    }
    if (videos) {
      videos.forEach(video => {
        video.pause();
      });
    }
  }

  /**
   * Get the user's current location from IP
   */
  getIpLocation() {
    this._ipAPI().subscribe(
      res => this.storage.setCountry(res.country_name),
      // eslint-disable-next-line no-console
      err => console.log(err)
    );
  }

  private _ipAPI(): Observable<any> {
    return this.http.get('https://ipapi.co/json');
  }

  /**
   * IF user lokking at a topic mark topic progress as stop reading when navigating.
   */
  markTopicStopOnNavigating() {
    if (this.storage.get('startReadTopic')) {
      this.topicService.updateTopicProgress(this.storage.get('startReadTopic'), 'stopped').subscribe(
        _response => {
          this.storage.remove('startReadTopic');
        },
        err => {
          console.error('error in mark Topic Stop On Navigating - ', err);
        }
      );
    }
  }

  /**
   * Initialise web services like Pusher/ apollo if there stack info in storage
   */
  async initWebServices(): Promise<void> {
    await this.pusherService.initialise();
    this.apolloService.initiateCoreClient();
    this.apolloService.initiateChatClient();
    this.utils.checkIsPracteraSupportEmail();
  }

  getNewJwt() {
    return this.requestService.get(api.get.jwt);
  }

  /**
   * @name refreshJWT
   * @description refresh JWT token, update teamId in storage, broadcast teamId
   *
   * @return  {Promise<any>} non-strict return value, we won't use
   */
  async refreshJWT(): Promise<any> {
    const res: {
      apikey: string;
      data?: {
        apikey: string;
        token?: {
          team_id?: number;
          teams: any[];
        };
      }
    } = await this.getNewJwt().toPromise();

    const token = res?.data?.token;
    const teamId = this.storage.getUser().teamId;
    if (teamId !== token?.team_id) {
      const team = { teamId: token.team_id };
      this.storage.setUser(team);
      this._team$.next(team);
    }
    return res;
  }
}
