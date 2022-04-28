import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Activity, Task } from '@v3/app/services/activity.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { UtilsService } from '@v3/app/services/utils.service';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
})
export class ActivityComponent {
  @Input() activity: Activity;
  @Input() currentTask: Task;
  @Output() navigate = new EventEmitter();
  constructor(
    private utils: UtilsService,
    private notificationService: NotificationsService
  ) { }

  leadIcon(task: Task) {
    switch (task.type) {
      case 'Locked':
        return 'lock-closed';
      case 'Topic':
        return 'reader';
      case 'Assessment':
        return 'eye';
    }
  }

  subtitle(task: Task) {
    if (this._noSubtitleLabel(task) || !this.assessmentNotSubmitted(task)) {
      return '';
    }
    // for locked team assessment
    if (task.isForTeam && task.isLocked) {
      return `${ task.submitter.name } is working on this`;
    }
    // due date
    if (!task.dueDate) {
      return '';
    }
    // overdue shows the label only
    if (task.isOverdue) {
      return '';
    }
    return `Due Data: ${ this.utils.utcToLocal(task.dueDate) }`;
  }

  label(task: Task) {
    if (this._noSubtitleLabel(task)) {
      return '';
    }
    // for locked team assessment
    if (task.isForTeam && task.isLocked) {
      return 'in progress';
    }
    if (!task.status || task.status === 'in progress') {
      if (task.isOverdue) {
        return 'overdue';
      }
      return '';
    }
    return task.status;
  }

  labelColor(task: Task) {
    if (this._noSubtitleLabel(task)) {
      return '';
    }
    // for locked team assessment
    if (task.isForTeam && task.isLocked) {
      return 'dark-blue';
    }
    switch (task.status) {
      case 'pending review':
        return 'warning';
      case 'feedback available':
        return 'success';
    }
    if ((!task.status || task.status === 'in progress') && task.isOverdue) {
      return 'danger';
    }
    return '';
  }

  _noSubtitleLabel(task: Task) {
    return task.type !== 'Assessment' || task.status === 'done';
  }

  endingIcon(task: Task) {
    if (task.isLocked || task.type === 'Locked') {
      return 'lock-closed';
    }
    switch (task.status) {
      case 'done':
        return 'checkmark-circle';
      default:
        return 'chevron-forward';
    }
  }

  endingIconColor(task: Task) {
    if (task.status === 'done') {
      return 'success';
    }
    return 'grey-75';
  }

  assessmentNotSubmitted(task) {
    return task.type === 'Assessment' && (!task.status || task.status === '' || task.status === 'in progress');
  }

  goto(task: Task) {
    if (task.type === 'Locked') {
      return this.notificationService.alert({
        message: 'This part of the app is still locked. You can unlock the features by engaging with the app and completing all tasks.',
        buttons: [
          {
            text: 'OK',
            role: 'cancel'
          }
        ]
      });
    }
    this.navigate.emit(task);
  }
}
