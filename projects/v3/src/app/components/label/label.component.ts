import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { Task } from "@v3/app/services/activity.service";

@Component({
  selector: 'app-label',
  templateUrl: 'label.component.html',
  styleUrls: ['label.component.scss'],
})
export class LabelComponent implements OnChanges {
  @Input() task: Task;
  name: string;
  color: string;

  ngOnChanges(changes: SimpleChanges): void {
    this.name = this.label();
    this.color = this.labelColor();
  }

  _noSubtitleLabel(task: Task) {
    return task.type !== 'Assessment' || task.status === 'done';
  }

  label(): string {
    if (this._noSubtitleLabel(this.task)) {
      return '';
    }
    // for locked team assessment
    if (this.task.isForTeam && this.task.isLocked) {
      return 'in progress';
    }
    if (!this.task.status || this.task.status === 'in progress') {
      if (this.task.isOverdue) {
        return 'overdue';
      }
      return '';
    }
    return this.task.status;
  }

  labelColor(): string {
    if (this._noSubtitleLabel(this.task)) {
      return '';
    }
    // for locked team assessment
    if (this.task.isForTeam && this.task.isLocked) {
      return 'dark-blue';
    }
    switch (this.task.status) {
      case 'pending review':
        return 'warning';
      case 'feedback available':
        return 'success';
    }
    if ((!this.task.status || this.task.status === 'in progress') && this.task.isOverdue) {
      return 'danger';
    }
    return '';
  }
}
