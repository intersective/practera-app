import { browser, $, $$, Key, ExpectedConditions, by } from 'protractor';
import { AppPage } from './app.po';

export class EventListPage extends AppPage {
  parent = $('app-event-list');
  btnBrowse = this.parent.$('ion-button.btn-left-half');
  btnBooked = this.parent.$('ion-button.btn-middle');
  btnAttended = this.parent.$('ion-button.btn-right-half');
  activityFilter = this.parent.$('ion-select');
  activityList = this.parent.$('ion-alert alert-checkbox-group').$$('button');
  btnFilterCancel = this.parent.$('ion-alert alert-button-group').$$('button').get(0);
  btnFilterOK = this.parent.$('ion-alert alert-button-group').$$('button').get(1);
  events = this.parent.$$('clickable-item');

  clickBrowse() {
    return this.btnBrowse.click();
  }

  clickBooked() {
    return this.btnBooked.click();
  }

  clickAttended() {
    return this.btnAttended.click();
  }

  clickActivityFilter() {
    return this.activityFilter.click();
  }

  /**
   * Select an activity from the activity filter
   * @param i The index of the activity
   */
  selectActivity(i: number) {
    return this.activityList.get(i).click();
  }

  clickFilterCancel() {
    return this.btnFilterCancel.click();
  }

  clickFilterOK() {
    return this.btnFilterOK.click();
  }

  /**
   * Get the name of an event
   * @param i The index of the event
   */
  getEventName(i: number) {
    return this.events.get(i).$('.event-name').getText();
  }

  /**
   * Click an event
   * @param i The index of the event
   */
  clickEvent(i: number) {
    return this.events.get(i).click();
  }

}
