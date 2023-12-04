import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestService } from 'request';
import { UtilsService } from '@v3/services/utils.service';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '@v3/environments/environment';
import { DemoService } from './demo.service';

export interface Topic {
  id: number;
  title: string;
  content: any;
  videolink?: string;
  files: Array<any>;
}

const api = {
  get: {
    stories: 'api/stories.json',
    progress: 'api/v2/motivations/progress/list.json'
  },
  post: {
    updateProgress: 'api/v2/motivations/progress/create.json',
  }
};

@Injectable({
  providedIn: 'root'
})

export class TopicService {
  private _topic$ = new BehaviorSubject<Topic>(null);
  topic$ = this._topic$.asObservable();

  topic: Topic;

  constructor(
    private request: RequestService,
    private utils: UtilsService,
    public sanitizer: DomSanitizer,
    private demo: DemoService
  ) {
    this.topic$.subscribe(res => this.topic = res);
  }

  clearTopic() {
    this._topic$.next(null);
  }

  getTopic(id: number) {
    if (!this.topic || this.topic.id !== id) {
      this.clearTopic();
    }
    if (environment.demo) {
      return this.demo.topic().subscribe(res => this._normaliseTopic(res.data));
    }
    return this.request.get(api.get.stories, {params: { model_id: id }})
      .pipe(map((response: any) => {
        if (response.success && response.data) {
          return this._normaliseTopic(response.data);
        }
      })
    ).subscribe();
  }

  private _normaliseTopic(data: any) {
    // In API response, 'data' is an array of topics
    // (since we passed topic id, it will return only one topic, but still in array format).
    // That's why we use data[0]
    if (!Array.isArray(data) || !this.utils.has(data[0], 'Story') || !this.utils.has(data[0], 'Filestore')) {
      return this.request.apiResponseFormatError('Story format error');
    }

    const topic: Topic = {
      id: 0,
      title: '',
      content: '',
      videolink: '',
      files: []
    };
    const thisTopic = data[0];
    if (!this.utils.has(thisTopic.Story, 'id') ||
      !this.utils.has(thisTopic.Story, 'title')) {
      return this.request.apiResponseFormatError('Story.Story format error');
    }
    topic.id = thisTopic.Story.id;
    topic.title = thisTopic.Story.title;
    // if API return empty string ("") to content, utils.has (lodash) take it as a value and this if statement works and set json to content
    // to privent that we checking topic content is not equels to empty string.
    if (this.utils.has(thisTopic.Story, 'content') && !this.utils.isEmpty(thisTopic.Story.content)) {
      thisTopic.Story.content = thisTopic.Story.content.replace(/text-align: center;/gi, 'text-align: center; text-align: -webkit-center;');
      thisTopic.Story.content = thisTopic.Story.content.replace(/(<iframe)/g, '<div class="video-embed"><iframe').replace(/(<\/iframe>)/g, '</iframe></div>');
      thisTopic.Story.content = thisTopic.Story.content.replace(/(<video)/g, '<video  class="video-embed"');
      topic.content = this.sanitizer.bypassSecurityTrustHtml(thisTopic.Story.content);
    }
    if (this.utils.has(thisTopic.Story, 'videolink')) {
      topic.videolink = thisTopic.Story.videolink;
    }
    topic.files = thisTopic.Filestore.map(item => ({url: item.slug , name: item.name}));
    this._topic$.next(topic);
    return topic;
  }

  updateTopicProgress(id, state) {
    if (environment.demo) {
      // eslint-disable-next-line no-console
      console.log('mark topic as ', state);
      return this.demo.normalResponse();
    }
    const postData = {
      model: 'topic',
      model_id: +id,
      state: state
    };
    return this.request.post({
      endPoint: api.post.updateProgress,
      data: postData,
    });
  }

  getTopicProgress(activityId, topicId): Observable<any> {
    return this.request.get(api.get.progress, {params: {
      model: 'Activity',
      model_id: +activityId,
      scope: 'Task'
    }})
    .pipe(map((response: any) => {
      if (response.success && !this.utils.isEmpty(response.data)) {
        const progress = response.data.Activity.Topic.find(function (topic) {
            return topic.id === topicId;
        });
        return progress.progress;
      } else {
        return false;
      }
    }));
  }

}
