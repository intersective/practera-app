import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Output() clickAction = new EventEmitter();
  icons = {
    feedback_available: 'information-circle-outline',
    review_submission: 'information-circle-outline',
    chat: 'chatbubbles-outline',
    event: 'calendar',
    assessment_submission_reminder: 'clipboard-outline',
  };

  constructor() {}

  gotoAction(keyboardEvent?: KeyboardEvent) {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    return this.clickAction.emit(this.todoItem);
  }

  get todoTitle(): string {
    switch (this.todoItem.type) {
      case 'review_submission':
        return $localize`:call to action btn:Review submission`;
      case 'feedback_available':
        return $localize`:call to action btn:Check feedback`;
      case 'assessment_submission_reminder':
        return $localize`:call to action btn:Check task`;
      case 'chat':
        return $localize`:call to action btn:Check the message`;
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
