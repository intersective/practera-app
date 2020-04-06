import { browser, $, $$, Key } from 'protractor';
import { AppPage } from './app.po';

export class LoginPage extends AppPage {
  inputEmail = $(`input[name="email"]`);
  inputPassword = $(`input[name="password"]`);
  btnLogin = $('app-auth-login').$('ion-button[type="submit"]');
  alertMsg = $('ion-alert').$('.alert-message');
  btnAlert = $('ion-alert').$('.alert-button');

  hasButton() {
    return this.btnLogin.getText();
  }

  insertEmail(email) {
    return this.inputEmail.sendKeys(email);
  }

  fillInAccount(user) {
    this.inputEmail.sendKeys(user.email);
    return this.inputPassword.sendKeys(user.password);
  }

  removeEmailnPassword() {
    this.inputEmail.clear();
    return this.inputPassword.clear();
  }

  deleteEmail() {
    return this.inputEmail.sendKeys(Key.BACK_SPACE);
  }

  clickLogin() {
    return this.btnLogin.click();
  }

  dismissAlert() {
    return this.btnAlert.click();
  }
}
