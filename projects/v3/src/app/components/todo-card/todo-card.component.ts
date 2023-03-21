import { Component, Input } from '@angular/core';
import { TodoItem } from '@v3/app/services/notifications.service';

@Component({
  selector: 'app-todo-card',
  templateUrl: './todo-card.component.html',
  styleUrls: ['./todo-card.component.scss']
})
export class TodoCardComponent {
  @Input() loading: boolean;
  @Input() todoItem: TodoItem;
  @Input() callToActionBtn: string;
  @Input() clickAction: (item: any) => Promise<any>;
  icons = {
    feedback_available: 'information-circle-outline',
    review_submission: 'information-circle-outline',
    chat: 'chatbubbles-outline',
    event: 'calendar',
    assessment_submission_reminder: 'clipboard-outline',
  };

  constructor() {}

  async gotoAction(): Promise<void> {
    return this.clickAction(this.todoItem).then(console.log);
  }

  get todoTitle(): string {
    switch (this.todoItem.type) {
      case 'review_submission':
        return 'Review submission';
      case 'feedback_available':
        return 'Check feedback';
      case 'assessment_submission_reminder':
        return 'Check task';
      case 'chat':
        return 'Check the message';
    }
    return this.todoItem.type;
  }

  get icon(): string {
    switch (this.todoItem.type) {
      case 'review_submission':
        return 'eye';
      case 'feedback_available':
        return 'notifications';
      case 'assessment_submission_reminder':
        return 'document-text';
      case 'chat':
        return 'mail';
    }
    return this.icons[this.todoItem.type];
  }
}
