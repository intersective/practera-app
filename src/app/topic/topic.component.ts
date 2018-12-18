import { TopicService, Topic, Progress } from './topic.service';
import { Component, OnInit } from '@angular/core';
import { EmbedVideoService } from 'ngx-embed-video';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss']
})
export class TopicComponent implements OnInit {
  topic: Topic;
  iframeHtml: string;
  btnToggleTopicIsDone: boolean = false;
  id: number = 0;
  activityId: number = 0;
  topicProgress: Progress;
  
  constructor( 
    private topicService: TopicService,
    private embedService: EmbedVideoService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.activityId = parseInt(this.route.snapshot.paramMap.get('activityId'));
    this._getTopic();
    this._getTopicProgress();
    this._btnIsDone();
   
   }

  private _getTopic() {
   this.topicService.getTopic(this.id)
      .subscribe(topic => {
        this.topic = topic;
        if ( topic.videolink ) {
          this.iframeHtml = this.embedService.embed(this.topic.videolink);
        }
      });
    }
  private _getTopicProgress() {
    this.topicService.getTopicProgress(this.activityId,this.id)
    .subscribe(result => {
      this.topicProgress = result;
    });
  }
  
  public _btnIsDone() {
    if (this.topicProgress !== null && this.topicProgress !== undefined) {
      //Check status of the topic
      if (this.topicProgress.progress === 1) {
          this.btnToggleTopicIsDone = true;
      } else {
          this.btnToggleTopicIsDone = false;
      }
    } else {
      this.btnToggleTopicIsDone = false;
    }
  }
  markAsDone () {
    this.btnToggleTopicIsDone = true;
    this.topicService.updateTopicStatus(this.id).subscribe();
 }
  previewFile () {
    console.log('show the file');
  }

  back() {
    this.router.navigate(['app', { outlets: { project: ['activity', this.activityId] }}]);
  }

}
