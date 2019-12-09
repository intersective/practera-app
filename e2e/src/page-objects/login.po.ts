import { browser, by, element, ExpectedConditions } from 'protractor';
import { USER } from '../../config';
import { AppPage } from './app.po';

export class LoginPage extends AppPage {
  inputEmail = element(by.css(`input[name="email"]`));
  inputPassword = element(by.css(`input[name="password"]`));
  btnLogin = element(by.css('app-auth-login')).element(by.deepCss('ion-button[type="submit"]'));
  alertMsg = element(by.css('ion-alert')).element(by.deepCss('.alert-message'));

  insertEmail(email) {
    return this.inputEmail.sendKeys(email);
  }

  insertPassword(password) {
    return this.inputPassword.sendKeys(password);
  }

  hasButton() {
    return this.btnLogin.getText();
  }

  fillInAccount(user) {
    this.insertEmail(user.email);
    return this.insertPassword(user.password);
  }

  clickLogin() {
    return this.btnLogin.click();
  }
}
