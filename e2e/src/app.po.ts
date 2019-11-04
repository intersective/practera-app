import { browser, by, element } from 'protractor';
import { USER } from '../config';

export class AppPage {
  navigateTo(page?) {
    return browser.get(page || '/');
  }

  getParagraphText() {
    return element(by.deepCss('app-root ion-content')).getText();
  }

  containsClass(ref) {
    return element(by.className(ref));
  }

  insertKeys(type, val) {
    const el = element(by.css(`input[name="${type}"]`));
    return el.sendKeys(val);
  }

  insertEmail() {
    return this.insertKeys('email', USER.email);
  }

  insertPassword() {
    return this.insertKeys('password', USER.password);
  }

  getTitle() {
    return element(by.css('ion-title')).getText();
  }

  loginButton() {
    return element(by.deepCss('ion-button[type="submit"]'));
  }

  hasButton() {
    return this.loginButton().getText();
  }
}
