import { Injectable } from '@angular/core';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
import { NotificationService } from '@shared/notification/notification.service';
import { RequestService } from '@shared/request/request.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { TopicService } from '../topic/topic.service';
import { ApolloService } from '@shared/apollo/apollo.service';
import { PusherService } from '@shared/pusher/pusher.service';

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
    private topicService: TopicService,
    private apolloService: ApolloService,
    private pusherService: PusherService
  ) {}

  // call this function on every page refresh and after switch program
  onPageLoad() {
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
        const { id, name, description, points, badge } = event.meta.Achievement;
        this.notification.achievementPopUp('notification', {
          id,
          name,
          description,
          points,
          image: badge
        });
      });
    }
  }

  updateProfile(data: Profile) {
    return this.request.post(
      {
        endPoint: api.post.profile,
        data
      });
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
   * Initialise web services like Pusher/ apollo if there stack info in storage
   */
  async initWebServices() {
    if (this.storage.stackConfig) {
      await this.pusherService.initialise();
      this.apolloService.initiateCoreClient();
      this.apolloService.initiateChatClient();
    }
  }

}
