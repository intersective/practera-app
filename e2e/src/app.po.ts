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

  insertKeys(type, val, parent?) {
    let el = element(by.css(`input[name="${type}"]`));
    if (parent) {
      el = parent.element(by.css(`input[name="${type}"]`));
    }
    return el.sendKeys(val);
  }

  insertEmail() {
    return this.insertKeys('email', USER.email);
  }

  insertPassword() {
    return this.insertKeys('password', USER.password);
  }

  getTitle(parent?) {
    if (parent) {
      return parent.element(by.css('ion-title')).getText();
    }
    return element(by.css('ion-title')).getText();
  }

  loginButton() {
    return element(by.css('app-auth-login')).element(by.deepCss('ion-button[type="submit"]'));
  }

  logoutButton() {
    return element(by.css('app-settings')).element(by.css('ion-content')).all(by.css('ion-card')).last().element(by.css('ion-item'));
  }

  loginAs(user) {
    const loginPage = element(by.css('app-auth-login'));
    this.insertKeys('email', user.email, loginPage);
    this.insertKeys('password', user.password, loginPage);

    const loginBtn = this.loginButton();
    loginBtn.click();
  }

  hasButton() {
    return this.loginButton().getText();
  }
}
