import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';

export interface Progress {
  id: number;
  progress: number;
}

export interface Topic {
  id: number;
  programId: number;
  title: string;
  content: string;
  videolink?: string;
  files:Array <object>;
  hasComments: boolean;

};


const api = {
  get: {
    stories:'/api/stories.json',
    progress: 'api/v2/motivations/progress/list.json'
  },
  post: {
    updateProgress: '/api/v2/motivations/progress/create.json',
  }
};



@Injectable({
  providedIn: 'root'
})

export class TopicService {
  topic :Topic;
  topicProgress: Progress;
  
  constructor(
    private request: RequestService,
    private utils: UtilsService,
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
      programId: 0,
      title: '',
      content: '',
      videolink: '',
      hasComments: false,
      files:[]
    };
    let thisTopic = data[0];
    console.log(data[0]);
      if (!this.utils.has(thisTopic.Story, 'id') || 
          !this.utils.has(thisTopic.Story, 'title'))
        return this.request.apiResponseFormatError('Story.Story format error');
      
    topic.id = thisTopic.Story.id;
    if (this.utils.has(thisTopic.Story, 'program_id')) {
      topic.programId = thisTopic.program_id;
    }
    topic.title = thisTopic.Story.title;
    if (this.utils.has(thisTopic.Story, 'content')) {
      topic.content = thisTopic.Story.content;
    }
    if (this.utils.has(thisTopic.Story, 'videolink')) {
      topic.videolink = thisTopic.Story.videolink;
    }
    topic.hasComments = thisTopic.Story.has_comments;
    topic.files = thisTopic.Filestore.map(item => ({url:item.slug , name:item.name}));
    console.log(topic);
    return topic;
  }
  
  updateTopicStatus(id){
    let postData;
   
    postData = {
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
          }) 
        } else {
        return false;
      }
        this.topicProgress = progress;
      })
    );
  }

}