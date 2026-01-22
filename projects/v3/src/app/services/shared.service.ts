import { AuthEndpoint, AuthService } from '@v3/services/auth.service';
import { Injectable } from '@angular/core';
import { UtilsService } from '@v3/services/utils.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { NotificationsService } from './notifications.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, first, firstValueFrom } from 'rxjs';
import { TopicService } from '@v3/services/topic.service';
import { ApolloService } from '@v3/services/apollo.service';
import { PusherService } from '@v3/services/pusher.service';
import { map, switchMap } from 'rxjs/operators';
import { AchievementService } from './achievement.service';
import { environment } from '../../environments/environment';

interface Team {
  id: number;
  name: string;
  uuid: string;
  projectBrief: string;
}

interface UserTeamsResponse {
  data: {
    user: {
      teams: Team[];
    };
  };
}

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
    private topicService: TopicService,
    private apolloService: ApolloService,
    private pusherService: PusherService,
    private achievementService: AchievementService,
    private authService: AuthService,
  ) { }

  // call this function on every page refresh and after switch program
  async onPageLoad(): Promise<void> {
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
      this.achievementEvent = this.utils.getEvent('achievement').subscribe(async event => {
        if (event.type === 'achievement_earned' && event?.meta?.Achievement) {
          const { id, name, description, points, badge } = event.meta.Achievement;
          await this.notification.achievementPopUp('notification', {
            id,
            name,
            description,
            points,
            image: badge
          });
          return this.achievementService.getAchievements();
        }

        // signal to pull latest get.todoItems (new_items event) from websocket
        // Sample data: { "type": "new_items", "message": "new items", "event": "achievement", "title": "Notice", "user_id": "14058", "notification_id": null }
        if (event.type === 'new_items' && event?.event === 'achievement') {
          await firstValueFrom(this.notification.getTodoItems());
        }
      });
    }
  }

  /**
   * @name getTeamInfo
   * @description pull team information which belongs to current user
   *              (determined by header data in the api request)
   *
   * @return  {Observable<UserTeamsResponse>} graphql response containing user teams data
   */
  getTeamInfo(): Observable<UserTeamsResponse> {
    return this.apolloService.graphQLFetch(
      `query user {
        user {
          teams {
            id
            name
            uuid
            projectBrief
          }
        }
      }`
    ).pipe(
      switchMap(async (response: UserTeamsResponse) => {
        if (response?.data?.user) {
          const thisUser = response.data.user;
          const teams: Team[] = thisUser.teams || [];
          const newTeamId: number | null = teams.length > 0 ? teams[0].id : null;
          const currentTeamId: number = this.storage.getUser().teamId;

          // get latest jwt if teamid changed
          if (currentTeamId !== newTeamId) {
            await this.refreshJWT();
          }

          // update storage with team information
          if (teams.length > 0) {
            this.storage.setUser({
              teamId: teams[0].id,
              teamName: teams[0].name,
              projectBrief: this.parseProjectBrief(teams[0].projectBrief),
              teamUuid: teams[0].uuid
            });
          } else {
            this.storage.setUser({
              teamId: null
            });
          }
        }
        return response;
      })
    );
  }

  /**
   * This method get all iframe and videos from documents and stop playing videos.
   */
  stopPlayingVideos() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
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
  }

  /**
   * Get the user's current location from IP
   */
  getIpLocation() {
    this._ipAPI().pipe(first()).subscribe({
      next: res => this.storage.setCountry(res.country_name),
      error: err => console.error(err)
    });
  }

  private _ipAPI(): Observable<any> {
    if (environment.production !== true) {
      // mock data for development mode
      return of({
        ip: '127.0.0.1',
        city: 'Development City',
        region: 'Development Region',
        country_name: 'Development Country',
        postal: '00000',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC'
      });
    }

    return this.http.get('https://ipapi.co/json');
  }

  /**
   * IF user lokking at a topic mark topic progress as stop reading when navigating.
   */
  markTopicStopOnNavigating() {
    if (this.storage.get('startReadTopic')) {
      this.topicService.updateTopicProgress(this.storage.get('startReadTopic'), 'stopped').subscribe({
        next: _response => {
          this.storage.remove('startReadTopic');
        },
        error: err => {
          console.error('error in mark Topic Stop On Navigating - ', err);
        }
      });
    }
  }

  /**
   * Initialise web services like Pusher/ apollo if there stack info in storage
   */
  async initWebServices(): Promise<void> {
    await this.pusherService.initialise();
    this.apolloService.initiateCoreClient();
    this.utils.checkIsPracteraSupportEmail();
  }

  /**
   * @name parseProjectBrief
   * @description safely parse project brief into object
   *              handles both stringified json and already-parsed objects from api
   *
   * @param   {string|object}  brief  project brief from api (string or object)
   * @return  {object|null}  parsed project brief object or null if invalid
   */
  private parseProjectBrief(brief: string | object): object | null {
    if (!brief) {
      return null;
    }

    // if already an object, return as-is
    if (typeof brief === 'object') {
      return brief;
    }

    // if string, try to parse as json
    if (typeof brief === 'string') {
      try {
        return JSON.parse(brief);
      } catch (e) {
        console.error('failed to parse project brief:', e);
        return null;
      }
    }

    return null;
  }

  /**
   * @name refreshJWT
   * @description refresh JWT token, update teamId in storage, broadcast teamId
   *
   * @return  {Promise<any>} non-strict return value, we won't use
   */
  async refreshJWT(): Promise<any> {
    const res: AuthEndpoint = await firstValueFrom(this.authService.authenticate());

    const auth = res?.data?.auth;
    const latestTeamId = auth?.experience?.team?.id;
    const teamId = this.storage.getUser().teamId;
    if (teamId !== latestTeamId) {
      const team = { teamId: latestTeamId };
      this.storage.setUser(team);
      this._team$.next(team);
    }
    return res;
  }
}
