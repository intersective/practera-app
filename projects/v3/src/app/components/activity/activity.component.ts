import { Subject } from 'rxjs';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { SharedService } from '@v3/app/services/shared.service';
import { UnlockIndicatorService } from '@v3/app/services/unlock-indicator.service';
import { Activity, ActivityService, Task } from '@v3/services/activity.service';
import { Submission } from '@v3/services/assessment.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
})
export class ActivityComponent implements OnInit, OnChanges, OnDestroy {
  @Input() activity!: Activity;
  @Input() currentTask: Task;
  @Input() submission: Submission;
  @Output() navigate = new EventEmitter();
  leadImage: string = null;
  newTasks: { [key: number]: any } = {};

  // when user isn't in a team & all tasks are found to be team tasks, emit this event
  // true: user not allowed to access
  // false: at least one non-team task
  @Output() cannotAccessTeamActivity = new EventEmitter();
  isForTeamOnly: boolean = false;
  private unsubscribe$: Subject<any> = new Subject();

  constructor(
    private utils: UtilsService,
    private storageService: BrowserStorageService,
    private notificationsService: NotificationsService,
    private sharedService: SharedService,
    private activityService: ActivityService,
    private unlockIndicatorService: UnlockIndicatorService
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  resetTaskIndicator(unlockedTasks) {
    this.newTasks = {};
    unlockedTasks
      .filter((task) => task.taskId)
      .forEach((task) => {
        this.newTasks[task.taskId] = true;
      });
  }

  ngOnInit() {
    this.leadImage = this.storageService.getUser().programImage;
    this.unlockIndicatorService.unlockedTasks$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(this.resetTaskIndicator);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.activity?.currentValue) {
      if (this.utils.isEqual(changes.activity.currentValue, changes.activity.previousValue)) {
        return;
      }
      const activities = this.storageService.get('activities');

      const currentActivity = (activities || {})[this.activity.id];
      if (currentActivity?.leadImage) {
        this.leadImage = currentActivity?.leadImage;
      }

      const currentValue = changes.activity.currentValue;
      if (currentValue.tasks?.length > 0) {
        // verify team status & restrict access
        this.activityService
          .nonTeamActivity(changes.activity.currentValue?.tasks)
          .then((nonTeamActivity) => {
            this.isForTeamOnly = !nonTeamActivity;
            this.cannotAccessTeamActivity.emit(this.isForTeamOnly);
          });

        // clear viewed unlocked indicator
        const unlockedTasks = this.unlockIndicatorService.getTasksByActivity(this.activity);
        this.resetTaskIndicator(unlockedTasks);
        if (unlockedTasks.length === 0) {
          const clearedActivities = this.unlockIndicatorService.clearActivity(this.activity.id);
          clearedActivities.forEach((activity) => {
            this.notificationsService
              .markTodoItemAsDone(activity)
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe();
          });
        }
      }
    }
  }

  /**
   * Task icon type
   *
   * @param   {Task}  task  task's type is the only required value
   *
   * @return  {string}      ionicon's name
   */
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

  // generate task state-based subtitle for activity list
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

    return `<strong>Due Date</strong>: ${ this.utils.utcToLocal(task.dueDate) }`;
  }

  label(task: Task) {
    if (this._noSubtitleLabel(task)) {
      return '';
    }
    // for locked team assessment
    if (task.isForTeam && task.isLocked) {
      return $localize`in progress`;
    }
    if (!task.status || task.status === 'in progress') {
      if (task.isOverdue) {
        return $localize`overdue`;
      }
      return '';
    }

    // below is redundant, but it's added for the sake of i18n
    if (task?.status === 'feedback available') {
      return $localize`feedback available`;
    }

    if (task?.status === 'pending review') {
      return $localize`pending review`;
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
        return 'warning black';
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

  assessmentNotSubmitted(task: Task) {
    return task.type === 'Assessment' && (!task.status || task.status === '' || task.status === 'in progress');
  }

  async goto(task: Task, keyboardEvent?: KeyboardEvent) {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    return this._validateTeamAssessment(task, async () => {
      if (task.type === 'Locked') {
        return this.notificationsService.alert({
          message: $localize`This part of the app is still locked. You can unlock the features by engaging with the app and completing all tasks.`,
          buttons: [
            {
              text: $localize`OK`,
              role: 'cancel'
            }
          ]
        });
      }

      this.navigate.emit(task);
    });
  }

  private async _validateTeamAssessment(task: Task, proceedCB): Promise<void> {
    // update teamId
    await this.sharedService.getTeamInfo().toPromise();

    const doAssessment = (this.utils.isEmpty(this.submission) || ['in progress', 'pending review'].includes(this.submission.status));
    const teamId = this.storageService.getUser().teamId;

    // display pop up if it is team assessment or team 360 assessment and user is not in team
    if (doAssessment && (task.isForTeam || task.assessmentType === 'team360') && !teamId) {
      return this.notificationsService.alert({
        message: $localize`Currently you are not in a team, please reach out to your Administrator or Coordinator to proceed with next steps.`,
        buttons: [
          {
            text: $localize`OK`,
            role: 'cancel',
          }
        ]
      });
    } else {
      return proceedCB();
    }
  }
}
