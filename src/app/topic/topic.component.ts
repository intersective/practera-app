import { Component, OnInit } from '@angular/core';
import { TopicService } from './topic.service';

@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss']
})
export class TopicComponent implements OnInit {
  topic = '';
  
  constructor( 
    private topicService: TopicService)
     { }

  ngOnInit() {
    this.topicService.getTopic()
      .subscribe(topic => this.topic = topic);
  }

}
