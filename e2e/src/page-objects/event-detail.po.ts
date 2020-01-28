import { browser, $, $$, Key, ExpectedConditions, by } from 'protractor';
import { AppPage } from './app.po';

export class EventDetailPage extends AppPage {
  parent = $('app-event-detail');
  eventName = this.parent.$('h1');
  activityName = this.parent.$('div-activity-name');
  eventDate = this.parent.$('#date');
  eventTime = this.parent.$('#time');
  eventLocation = this.parent.$('#location');
  eventCapacity = this.parent.$('#capacity');
  btnCTA = this.parent.$('.btn-cta');
  btnClose = this.parent.$('.close-icon');

  getEventName() {
    return this.eventName.getText();
  }

  getActivityName() {
    return this.activityName.getText();
  }

  getEventDate() {
    return this.eventDate.getText();
  }

  getEventTime() {
    return this.eventTime.getText();
  }

  getEventLocation() {
    return this.eventLocation.getText();
  }

  getEventCapacity() {
    return this.eventCapacity.getText();
  }

  getCTAButtonText() {
    return this.btnCTA.getText();
  }

  clickCTAButton() {
    return this.btnCTA.click();
  }

  clickCloseButton() {
    return this.btnClose.click();
  }

}
