import { Component, Input } from '@angular/core';
import { TodoItem } from '../home.service';

@Component({
  selector: 'app-todo-card',
  templateUrl: './todo-card.component.html',
  styleUrls: ['./todo-card.component.scss']
})
export class TodoCardComponent {
  @Input() loading: boolean;
  @Input() todoItem: TodoItem;
  icons = {
    feedback_available: 'information-circle-outline',
    review_submission: 'information-circle-outline',
    chat: 'chatbubbles-outline',
    event: 'calendar',
    assessment_submission_reminder: 'clipboard-outline'
  };

  constructor() {}

}
