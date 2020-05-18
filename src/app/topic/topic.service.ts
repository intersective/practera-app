import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';
import { DomSanitizer } from '@angular/platform-browser';

export interface Topic {
  id: number;
  title: string;
  content: any;
  videolink?: string;
  files: Array<object>;
  hasComments: boolean;
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

  constructor(
    private request: RequestService,
    private utils: UtilsService,
    public sanitizer: DomSanitizer,
  ) { }

  getTopic(id: number): Observable<any> {
    return this.request.get(api.get.stories, {params: { model_id: id }})
      .pipe(map(response => {
        if (response.success && response.data) {
          return this._normaliseTopic(response.data);
        }
      })
    );
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
      hasComments: false,
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
    topic.hasComments = thisTopic.Story.has_comments;
    topic.files = thisTopic.Filestore.map(item => ({url: item.slug , name: item.name}));

    return topic;
  }

  updateTopicProgress(id) {
    const postData = {
      model: 'topic',
      model_id: id,
      state: 'completed'
    };
    return this.request.post(api.post.updateProgress, postData);
  }

  getTopicProgress(activityId, topicId): Observable<any> {
    return this.request.get(api.get.progress, {params: {
      model: 'Activity',
      model_id: activityId,
      scope: 'Task'
    }})
    .pipe(map(response => {
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
