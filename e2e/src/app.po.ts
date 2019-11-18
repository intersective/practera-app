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

  insertEmail(email?, parent?) {
    return this.insertKeys('email', email || USER.email, parent);
  }

  insertPassword(password?, parent?) {
    return this.insertKeys('password', password || USER.password, parent);
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

  registerButton() {
    return element(by.css('app-auth-registration')).element(by.deepCss('ion-button'));
  }

  getTabs() {
    return element(by.css('ion-tab-bar')).all(by.css('ion-tab-button'));
  }

  projectPageTitle() {
    return element(by.css('app-project')).element(by.css('ion-title'));
  }

  getHomeScreen() {
    const homeComponentContent = element(by.css('app-home'));
    return homeComponentContent;
  }

  submitTopic(topic = element(by.css('app-topic'))) {
    const continueBtn = topic.element(by.tagName('ion-footer')).element(by.css('ion-button'));
    continueBtn.click();
  }

  submitAssessment(assessment = element(by.css('app-assessment'))) {
    const continueBtn = assessment.element(by.tagName('ion-content')).element(by.css('ion-button'));
    continueBtn.click();
  }
}
