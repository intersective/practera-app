import { browser, $, $$, Key, ExpectedConditions } from 'protractor';

export class AppPage {
  tabs = $('ion-tabs');
  tabSettings = this.tabs.$(`ion-tab-button[tab="settings"]`);

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
  waitUntilTabPresent() {
    return this.wait(ExpectedConditions.presenceOf(this.tabs));
  }

  clickTab(tab) {
    switch (tab) {
      case 'settings':
        return this.tabSettings.click();
    }
  }
}
