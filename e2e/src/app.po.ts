import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
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
    return this.insertKeys('email', 'protractor@test.com');
  }

  insertPassword() {
    return this.insertKeys('password', 'kW96dLJHrQDaaLM');
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
