import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DemoService } from './demo.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  notifications$: Subject;

  constructor(demo: DemoService) { }
}
