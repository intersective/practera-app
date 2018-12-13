import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';
import { FilestackComponent } from '@shared/filestack/filestack.component';
import { fileURLToPath } from 'url';


const api = {
  stories:'/api/stories.json'
}

export interface Topic {
  id: number,
  programId: number,
  title: string,
  content: string,
  videolink: string,
  files:Array <object>,
  hasComments: boolean,

};


@Injectable({
  providedIn: 'root'
})

export class TopicService {
 
  topic :Topic=
    { 
      id: 1,
      programId: 260,
      title: 'Welcome and Warm-up',
      content: '<div>At the end of this activity you will submit an agreed Project Charter explaining what and how your team will deliver value to your Project Stakeholder. A Project Charter is a great way to ensure team, project stakeholder and consulting mentor are in agreement on the work to be delivered and how it will get achieved. Below is a series of steps and instructions that will guide you and your team through the process of creating a project charter.</div><div><br></div><div><b>STEP 1: Organise a Kick-Off meeting with your team and consulting mentor</b></div>',
      videolink: 'https://www.youtube.com/watch?v=nby5jgjb0Dk',
      hasComments: false,
      files: [
        {
          url: "https://www.filepicker.io/api/file/seqhKHMNQnmxeXBxsiKQ",
          
        },
      ]
    };

  topicDone = {
    1: false,
    2: false
  }
  
  constructor(
    private request: RequestService,
    private utils: UtilsService,
  ) { }

  getTopic(id: number): Observable<any> {
    return this.request.get(api.stories, {params: {id: id}})
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
    data[0].Filestore.forEach(function(item){
      file.push({'url':item.slug});
    });
    file.forEach(function(item) {
      topic.files.push(item);
    })
    
  }
  
  saveTopicRead(topicId) {
    console.log('topic is marked as read.');
  }
  getTopicIsDone(topicId) {
    return of(this.topicDone[topicId] ? this.topicDone[topicId] : false);
  }
}
