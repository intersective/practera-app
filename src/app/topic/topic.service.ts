import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';
import { FilestackComponent } from '@shared/filestack/filestack.component';


export interface Progress {
  id: number;
  progress: number;
}

export interface Topic {
  id: number;
  programId: number;
  title: string;
  content: string;
  videolink: string;
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
    return this.request.get(api.get.stories, {params: {id: id}})
      .pipe(map(response => {
        if (response.success && response.data) {
          return this._normaliseTopic(response.data);
        }
      })
    );
  }

  private _normaliseTopic (data: any){
     // In API response, 'data' is an array of topics(since we passed topic id, it will return only one topic, but still in array format). That's why we use data[0]
     if (!Array.isArray(data) || !this.utils.has(data[0], 'Story')) {
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
    let file = [];
    topic.id = data[0].Story.id;
    topic.programId = data[0].program_id;
    topic.title = data[0].Story.title;
    topic.content = data[0].Story.content;
    topic.videolink = data[0].Story.videolink;
    topic.hasComments = data[0].Story.has_comments;
    // data[0].Filestore.forEach(function(item){
    //   file.push({'url':item.slug});
    // });
    // file.forEach(function(item) {
    //   topic.files.push(item);
    // })
    topic.files = data[0].Filestore.map(item => ({url:item.slug}))
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
  
  getTopicProgress(topicId): Observable<any> {
    return this.request.get(api.get.progress, {params: {
        model: 'Activity',
        model_id: topicId,
        scope: 'Task'
      }})
      .pipe(map(response => {
        if (response.success && response.data) {
          var progress = response.data.Activity.Topic.find(function (topic) {
            return topic.id === topicId;
        });
        }
        this.topicProgress = progress;
      })
    );
  }

}