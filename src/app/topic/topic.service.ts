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
  files:Array <object>;
  hasComments: boolean;
}

const api = {
  get: {
    stories:'api/stories.json',
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

  private _normaliseTopic (data: any){
     // In API response, 'data' is an array of topics(since we passed topic id, it will return only one topic, but still in array format). That's why we use data[0]
     if (!Array.isArray(data) || !this.utils.has(data[0], 'Story') || !this.utils.has(data[0], 'Filestore')) {
      return this.request.apiResponseFormatError('Story format error');
    }

    let topic: Topic = {
      id: 0,
      title: '',
      content: '',
      videolink: '',
      hasComments: false,
      files:[]
    };
    let thisTopic = data[0];
    if (!this.utils.has(thisTopic.Story, 'id') ||
        !this.utils.has(thisTopic.Story, 'title')) {
      return this.request.apiResponseFormatError('Story.Story format error');
    }
    topic.id = thisTopic.Story.id;
    topic.title = thisTopic.Story.title;
    if (this.utils.has(thisTopic.Story, 'content')) {
      thisTopic.Story.content = this._adjustAlignment(thisTopic.Story.content);
      topic.content = this.sanitizer.bypassSecurityTrustHtml(thisTopic.Story.content);
    }
    if (this.utils.has(thisTopic.Story, 'videolink')) {
      topic.videolink = thisTopic.Story.videolink;
    }
    topic.hasComments = thisTopic.Story.has_comments;
    topic.files = thisTopic.Filestore.map(item => ({url:item.slug , name:item.name}));

    return topic;
  }

  private _adjustAlignment(content) {
    let fullText = '';
    let textStyle = 'text-align: center; text-align: -webkit-center;';
    let splittedText = content.split("text-align: center;");
    if (splittedText) {
      splittedText.forEach((element, index) => {
        if (index < (splittedText.length-1)) {
          fullText += (element + textStyle);
        } else {
          fullText += element;
        }
      });
      return fullText;
    }
    return content;
  }

  updateTopicProgress(id){

     let postData = {
      model: "topic",
      model_id: id,
      state: "completed"
    }
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
        var progress = response.data.Activity.Topic.find(function (topic) {
            return topic.id === topicId;
        });
        return progress.progress;
      } else {
          return false;
      }
    }));
  }

}
