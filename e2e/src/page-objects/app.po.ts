import { browser } from 'protractor';

export class AppPage {
  navigateTo(page?) {
    return browser.get(page || '/');
  }
  currentUrl() {
    return browser.getCurrentUrl();
  }
  wait(callback) {
    return browser.wait(callback);
  }
  sleep(ms) {
    return browser.sleep(ms);
  }
  waitForAngularEnabled() {
    return browser.waitForAngularEnabled(true);
  }
  waitForAngularDisabled() {
    return browser.waitForAngularEnabled(false);
  }
}
