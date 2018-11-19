import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TopicService {
  topic = { 
    id: 1,
    title: 'Welcome and Warm-up',
    content: 'Welcome to Practera Phase 2, great to see you on-board!',
    videolink: 'https://vimeo.com/157064711',
  };

  constructor() { }
  getTopic(): Observable<any> {
    return of(this.topic);
  }
}
