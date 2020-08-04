import { Injectable } from '@angular/core';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
import { NotificationService } from '@shared/notification/notification.service';
import { RequestService } from '@shared/request/request.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { TopicService } from '../topic/topic.service';

export interface Profile {
  contact_number: string;
  email?: string;
  sendsms?: boolean;
}

const api = {
  post: {
    profile: 'api/v2/user/enrolment/edit.json',
  },
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
    private topicService: TopicService
  ) {}

  // call this function on every page refresh and after switch program
  onPageLoad() {
    this.getIpLocation();
    // only do these if a timeline is choosen
    if (!this.storage.getUser().timelineId) {
      return;
    }
    // check and change theme color on every page refresh
    const color = this.storage.getUser().themeColor;
    if (color) {
      this.utils.changeThemeColor(color);
    }
    const image = this.storage.getUser().activityCardImage;
    if (image) {
      this.utils.changeCardBackgroundImage(image);
    }

    // subscribe to the achievement event if it is not subscribed
    if (!this.achievementEvent) {
      this.achievementEvent = this.utils.getEvent('achievement').subscribe(event => {
        this.notification.achievementPopUp('notification', {
          id: event.meta.Achievement.id,
          name: event.meta.Achievement.name,
          description: event.meta.Achievement.description,
          points: event.meta.Achievement.points,
          image: event.meta.Achievement.badge
        });
      });
    }
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

}
