import { Injectable } from '@angular/core';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
import { NotificationService } from '@shared/notification/notification.service';
import { RequestService } from '@shared/request/request.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { TopicService } from '../topic/topic.service';
import { PusherService } from '@shared/pusher/pusher.service';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { AuthService } from '@app/auth/auth.service';

export interface Profile {
  contact_number: string;
  email?: string;
  sendsms?: boolean;
}

const api = {
  post: {
    profile: 'api/v2/user/enrolment/edit.json',
  },
  get: {
    teams: 'api/teams.json',
  }
};

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private achievementEvent;
  private memoryCache = {};

  constructor(
    private utils: UtilsService,
    private storage: BrowserStorageService,
    private notification: NotificationService,
    private request: RequestService,
    private http: HttpClient,
    private newrelic: NewRelicService,
    private readonly topicService: TopicService,
    private readonly pusherService: PusherService,
    private readonly authService: AuthService,
  ) {}

  // call this function on every page refresh and after switch program
  onPageLoad(): void {
    const appV3Activated = this.storage.getAppV3();
    if (appV3Activated === true) {
      return this.authService.forceRedirectToV3(this.storage.getUser().apikey);
    }
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
        if (event && event.meta && event.meta.Achievement) {
          const { id, name, description, points, badge } = event.meta.Achievement;
          this.notification.achievementPopUp('notification', {
            id,
            name,
            description,
            points,
            image: badge
          });
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
    return this.request.graphQLFetch(
      `query user {
        user {
          teams {
              id
              name
          }
        }
      }`,
      {
        noCache: true
      }
    ).pipe(map(response => {
      if (response.data && response.data.user) {
        const thisUser = response.data.user;

        if (!this.utils.has(thisUser, 'teams') ||
          !Array.isArray(thisUser.teams) ||
          !this.utils.has(thisUser.teams[0], 'id')
        ) {
          return this.storage.setUser({
            teamId: null
          });
        }
        return this.storage.setUser({
          teamId: thisUser.teams[0].id
        });
      }
      return response;
    }));
  }

  updateProfile(data: Profile) {
    return this.request.post(api.post.profile, data);
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
      return 'Overdue ' + this.utils.utcToLocal(dueDate);
    }
    return 'Due ' + this.utils.utcToLocal(dueDate);
  }

  /**
   * This method get all iframe and videos from documents and stop playing videos.
   */
  stopPlayingVideos() {
    const iframes = Array.from(document.querySelectorAll( 'iframe'));
    const videos = Array.from(document.querySelectorAll( 'video' ));
    if ( iframes ) {
      iframes.forEach(frame => {
        frame.src = null;
      });
    }
    if ( videos ) {
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
      err => this.newrelic.noticeError(err)
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
        response => {
          this.storage.remove('startReadTopic');
        },
        err => {
          console.log('error in mark Topic Stop On Navigating - ', err);
        }
      );
    }
  }

  /**
  * Initialise web services like Pusher
  */
  async initWebServices() {
    await this.pusherService.initialise();
  }

}
