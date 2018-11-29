import { TopicService } from './topic.service';
import { Component, OnInit } from '@angular/core';
import { EmbedVideoService } from 'ngx-embed-video';

@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss']
})
export class TopicComponent implements OnInit {
  topic : any;
  iframeHtml: any;
  btnToggleTopicIsDone: boolean = false;
  
  constructor( 
    private topicService: TopicService,
    private embedService: EmbedVideoService
  ) {}

  ngOnInit() {
    this.topicService.getTopic()
      .subscribe(topic => this.topic = topic);
      this.iframeHtml = this.embedService.embed(this.topic.videolink);  
  }
  markAsDone () {
    this.btnToggleTopicIsDone = true;
    console.log('topic is marked as read.');
  }
  previewFile () {
    console.log('show the file');
  }

}
