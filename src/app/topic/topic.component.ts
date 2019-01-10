import { TopicService, Topic } from './topic.service';
import { Component, OnInit } from '@angular/core';
import { EmbedVideoService } from 'ngx-embed-video';
import { Router, ActivatedRoute } from '@angular/router';
import { FilestackService } from '@shared/filestack/filestack.service';

@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss']
})
export class TopicComponent implements OnInit {
  topic: Topic = {
    id: 0,
    title: '',
    content: '',
    videolink: '',
    files:[],
    hasComments: false
  };
  iframeHtml: string ='';
  btnToggleTopicIsDone: boolean = false;
  loadingMarkedDone: boolean = true;
  id: number = 0;
  activityId: number = 0;
  topicProgress: number;
  
  constructor( 
    private topicService: TopicService,
    private embedService: EmbedVideoService,
    private router: Router,
    private route: ActivatedRoute,
    private filestackService: FilestackService
  ) {}

  ngOnInit() {
    this.id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.activityId = parseInt(this.route.snapshot.paramMap.get('activityId'));
    this._getTopic();
    this._getTopicProgress();
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

        if (this.topicProgress !== null && this.topicProgress !== undefined) {
          if (this.topicProgress === 1) {
            this.btnToggleTopicIsDone = true;
          } 
        }
        this.loadingMarkedDone = false;
      });
   }

  markAsDone() {
    this.btnToggleTopicIsDone = true;
    this.topicService.updateTopicProgress(this.id).subscribe();
  }
  
  previewFile(file) {
    this.filestackService.previewFile(file);
  }

  back() {
    this.router.navigate(['app', { outlets: { project: ['activity', this.activityId] }}]);
  }

}
