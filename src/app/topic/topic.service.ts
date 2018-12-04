import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HtmlTagDefinition, ArrayType } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class TopicService {
  topic: {
    id: number,
    title: string,
    content: string,
    videolink: string,
    files: object,
  } = 
  { 
    id: 1,
    title: 'Welcome and Warm-up',
    content: '<div>At the end of this activity you will submit an agreed Project Charter explaining what and how your team will deliver value to your Project Stakeholder. A Project Charter is a great way to ensure team, project stakeholder and consulting mentor are in agreement on the work to be delivered and how it will get achieved. Below is a series of steps and instructions that will guide you and your team through the process of creating a project charter.</div><div><br></div><div><b>STEP 1: Organise a Kick-Off meeting with your team and consulting mentor</b></div>',
    videolink: 'https://www.youtube.com/watch?v=nby5jgjb0Dk',
    files: [
      {
        "name": "JS2_Program_Overview_2016Aug-1.pdf",
        "extension": ".pdf",
        "path": "s3://practera/uploads/b14a7b8059d9c055954c92674ce60032/pHzgZpjQ6eCDPXPWovhT_JS2_Program_Overview_2016Aug-1.pdf",
        "type": "application/pdf",
        "size": 1006217,
        "visibility": "program",
        " experience_id": 44,
        "program_id": 176,
        "url": "https://www.filepicker.io/api/file/seqhKHMNQnmxeXBxsiKQ",
        "model": "Story.Topic",
        "foreign_key": 3460
      },
    ]

  };

  topicDone = {
    1: false,
    2: false
  }
  
  constructor() { }
  getTopic(id): Observable<any> {
    return of(this.topic);
  }
  saveTopicRead(topicId) {
    console.log('topic is marked as read.');
  }
  getTopicIsDone(topicId) {
    return of(this.topicDone[topicId] ? this.topicDone[topicId] : false);
  }
}
