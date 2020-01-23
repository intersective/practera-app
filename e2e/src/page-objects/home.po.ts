import { browser, $, $$, Key, ExpectedConditions, by } from 'protractor';
import { AppPage } from './app.po';

export class HomePage extends AppPage {
  parent = $('app-overview-routing');
  home = this.parent.$('app-home');
  textProgramName = this.parent.$('ion-title');
  textProjectProgress = this.home.$('app-cicle-progress').$$('tspan').get(0);
  btnAchievementAll = this.home.$('.achievement').$('a');
  badges = this.home.$$('achievement-badge .badge');
  todoCards = this.home.$$('app-todo-card');
  project = this.parent.$('app-project');
  milestones = this.project.$$('.project-item');

  getProgramName() {
    return this.textProgramName.getText();
  }

  getProjectProgress() {
    return this.textProjectProgress.getText();
  }

  clickViewAll() {
    return this.btnAchievementAll.click();
  }

  /**
   * Click a badge
   * @param i the index of badges, start from 0
   */
  clickBadge(i: number) {
    return this.badges.get(i).click();
  }

  /**
   * Return a card element from given card title
   */
  getTodoCardByTitle(title: string) {
    return this.todoCards.find(card => card.$('.todo-card-title').getText() === title);
  }

  /**
   * Click a todo card
   * @param card Card element, which can be returned from getTodoCardByTitle()
   */
  clickTodoCard(card) {
    return card.click();
  }

  /**
   * Get the sub-title of a todo card to verify the text
   * @param card Card element, which can be returned from getTodoCardByTitle()
   */
  getTodoCardSubtitle(card) {
    return card.$('.todo-card-subtitle').getText();
  }

  /**
   * Get the name of a milestone
   * @param i Index of milestones, start from 0
   */
  getMilestoneName(i: number) {
    return this.milestones.get(i).$('.milestone-title').getText();
  }

  /**
   * Get the description of a milestone
   * @param i Index of milestones, start from 0
   */
  getMilestoneDescription(i: number) {
    return this.milestones.get(i).$('.milestone-description p').getText();
  }

  /**
   * Check if a milestone is locked
   * @param i Index of milestones, start from 0
   */
  isMilestoneLocked(i: number) {
    return !!this.milestones.get(i).$('.milestone-lock');
  }

  /**
   * Get an activity card object
   * @param milestoneIndex Index of milestone, start from 0
   * @param activityIndex  Index of activity inside the milestone, start from 0
   */
  getActivityCard(milestoneIndex: number, activityIndex: number) {
    return this.milestones.get(milestoneIndex).$$('.activity-list app-activity-card').get(activityIndex);
  }

  /**
   * Get the name of an activity card
   * @param card Card element, can be returned from getActivityCard()
   */
  getActivityName(card) {
    return card.$('.activity-name').getText();
  }

  /**
   * Click the activity card
   * @param card Card element, can be returned from getActivityCard()
   */
  clickActivityCard(card) {
    return card.click();
  }

  /**
   * Check if an activity is locked
   * @param milestoneIndex Index of milestone, start from 0
   * @param activityIndex  Index of activity inside the milestone, start from 0
   */
  isActivityLocked(milestoneIndex: number, activityIndex: number) {
    return !!this.milestones.get(milestoneIndex).$$('.activity-list .row-cards').get(activityIndex).$('ion-icon');
  }

}
