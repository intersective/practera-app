import { Injectable } from '@angular/core';
import { DemoService } from './demo.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  // notifications$: Subject;

  constructor(demo: DemoService) { }
}
