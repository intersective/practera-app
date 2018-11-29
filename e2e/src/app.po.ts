import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  async getParagraphText() {
    return await element(by.deepCss('app-root ion-content')).getText();
  }

  async insertKeys(type, val) {
	  let el = element(by.deepCss(`form ion-input[type="${type}"] input`));
	  return await el.sendKeys(val);
  }

  async insertEmail() {
  	return await this.insertKeys('email', 'chaw@test.com');
  }

  async insertPassword() {
  	return await this.insertKeys('password', '12341234');
  }

  async getTitle() {
  	return await element(by.deepCss('ion-title')).getText();
  }

  loginButton() {
  	return element(by.deepCss('ion-button[type="submit"]'));
  }

  hasButton() {
    return this.loginButton().getText();
  }
}
