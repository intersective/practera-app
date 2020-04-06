import { browser, $, $$, Key, ExpectedConditions } from 'protractor';

export class AppPage {
  tabs = $('ion-tabs');
  tab = name => this.tabs.$(`ion-tab-button[tab="${name}"]`);

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
    return this.tab(tab).click();
  }
}
