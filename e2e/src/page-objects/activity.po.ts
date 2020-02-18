import { browser, $, $$, Key, ExpectedConditions, by } from 'protractor';
import { AppPage } from './app.po';

export class ActivityPage extends AppPage {
  parent = $('app-activity');
  title = this.parent.$('h1');
  description = this.parent.$('app-description p');
  tasks = this.parent.$$('#tasks-card app-list-item');
  events = this.parent.$$('#events-card app-list-item');

  getActivityName() {
    return this.title.getText();
  }

  getActivityDescription() {
    return this.description.getText();
  }

  /**
   * Get the name of a task
   * @param i The index of the task
   */
  getTaskName(i: number) {
    return this.tasks.get(i).$('.item-title').getText();
  }

  /**
   * Get the due date of a task
   * @param i The index of the task
   */
  getTaskDueDate(i: number) {
    return this.tasks.get(i).$('.item-subtitle-1').getText();
  }

  /**
   * Get the type & status of a task
   * @param i The index of the task
   */
  getTaskTypeStatus(i: number) {
    return this.tasks.get(i).$('.item-subtitle-2').getText();
  }

  /**
   * Click a task
   * @param i The index of the task
   */
  clickTask(i: number) {
    return this.tasks.get(i).click();
  }

  /**
   * Get the name of an event
   * @param i The index of the event
   */
  getEventName(i: number) {
    return this.events.get(i).$('.item-title').getText();
  }

  /**
   * Click an event
   * @param i The index of the event
   */
  clickEvent(i: number) {
    return this.events.get(i).click();
  }

}
