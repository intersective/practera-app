import { browser } from 'protractor';

export class AppPage {
  navigateTo(page?) {
    return browser.get(page || '/');
  }
  wait(callback) {
    return browser.wait(callback);
  }
  sleep(ms) {
    return browser.sleep(ms);
  }
}
