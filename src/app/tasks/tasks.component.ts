import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { UtilsService } from '@services/utils.service';
import { RouterEnter } from '@services/router-enter.service';
import { BrowserStorageService } from '@services/storage.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent extends RouterEnter {
  routeUrl = '/app/activity';
  activityId: number;
  topicId: number;
  assessmentId: number;
  contextId: number;
  @ViewChild('activity') activity;
  @ViewChild('topic') topic;
  @ViewChild('assessment') assessment;
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public storage: BrowserStorageService,
    public utils: UtilsService
  ) {
    super(router);
  }

  onEnter() {
    this.activityId = +this.route.snapshot.paramMap.get('id');
    this.topicId = null;
    this.assessmentId = null;
    // trigger onEnter after the element get generated
    setTimeout(() => {
      this.activity.onEnter();
    });
  }

  /**
   * Go to the specific task based on parameters
   * Or go to the first unfinished task inside this activity
   */
  goToFirstTask(tasks) {
    // only go to a task if we don't have a current task yet
    if (this.topicId || this.assessmentId) {
      return ;
    }
    // check if we need to go to a specific task
    if (this._goToTask()) {
      return ;
    }
    // find the first task that is not done or pending review
    // and is allowed to access for this user
    let firstTask = tasks.find(task => {
      return !['done', 'pending review'].includes(task.status) &&
        task.type !== 'Locked' &&
        !(task.isForTeam && !this.storage.getUser().teamId) &&
        !task.isLocked;
    });
    if (!firstTask) {
      firstTask = tasks[0];
    }
    // goto the first task
    switch (firstTask.type) {
      case 'Topic':
        this.goto({
          type: 'topic',
          topicId: firstTask.id
        });
        break;
      case 'Assessment':
        this.goto({
          type: 'assessment',
          contextId: firstTask.contextId,
          assessmentId: firstTask.id
        });
        break;
    }
  }

  /**
   * If parameters are passed in, go to the specific task
   */
  private _goToTask() {
    // go to a task directly if parameters passed in
    const task = this.route.snapshot.paramMap.get('task');
    if (!task) {
      return false;
    }
    const taskId = +this.route.snapshot.paramMap.get('task_id');
    if (!taskId) {
      return false;
    }
    switch (task) {
      case 'topic':
        this.goto({
          type: 'topic',
          topicId: taskId
        });
        break;
      case 'assessment':
        const contextId = +this.route.snapshot.paramMap.get('context_id');
        if (!contextId) {
          return false;
        }
        this.goto({
          type: 'assessment',
          assessmentId: taskId,
          contextId: contextId
        });
        break;
      default:
        return false;
    }
    return true;
  }

  // display the task content in the right pane, and highlight on the left pane
  goto(event) {
    switch (event.type) {
      case 'topic':
        this.topicId = event.topicId;
        // hide the assessment component
        this.assessmentId = null;
        // trigger onEnter after the element get generated
        setTimeout(() => {
          this.topic.onEnter();
        });
        break;
      case 'assessment':
        this.assessmentId = event.assessmentId;
        this.contextId = event.contextId;
        // hide the topic component
        this.topicId = null;
        // trigger onEnter after the element get generated
        setTimeout(() => {
          this.assessment.onEnter();
        });
        break;
    }
  }

  // get the currently selected task
  currentTask() {
    if (this.topicId) {
      return {
        id: this.topicId,
        type: 'Topic'
      };
    }
    if (this.assessmentId) {
      return {
        id: this.assessmentId,
        type: 'Assessment'
      };
    }
    return null;
  }

}
