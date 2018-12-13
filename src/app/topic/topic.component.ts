import { TopicService, Topic } from './topic.service';
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
    this._getTopicIsDone();
   
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
  private _getTopicIsDone() {
    this.topicService.getTopicIsDone(this.id)
    .subscribe(result => {
      this.btnToggleTopicIsDone = result;
    });
  }
    
  markAsDone () {
    this.btnToggleTopicIsDone = true;
    this.topicService.saveTopicRead(this.id);
    
  }
  previewFile () {
    console.log('show the file');
  }

  back() {
    this.router.navigate(['app', { outlets: { project: ['activity', this.activityId] }}]);
  }

}
