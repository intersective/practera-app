import { browser, $, $$, Key } from 'protractor';
import { AppPage } from './app.po';

export class RegistrationPage extends AppPage {
  parent = $(`app-auth-registration`);
  textPopup = $('app-pop-up').$('#popup-message');
  btnPopup = $('app-pop-up').$('#btn-popup-confirm');
  inputPassword = this.parent.$(`input[name="password"]`);
  inputConfirmPassword = this.parent.$(`input[name="confirmPassword"]`);
  checkbox = this.parent.$('ion-checkbox[name="isAgreed"]');
  textError = this.parent.$('.text-error');
  btnRegister = this.parent.$('#btn-register');

  getPopupText() {
    return this.textPopup.getText();
  }

  getFormErrorText() {
    return this.textError.getText();
  }

  dismissPopup() {
    return this.btnPopup.click();
  }

  insertPassword(password) {
    return this.inputPassword.sendKeys(password);
  }

  insertConfirmPassword(password) {
    return this.inputConfirmPassword.sendKeys(password);
  }

  clickCheckbox() {
    return this.checkbox.click();
  }

  clickRegister() {
    return this.btnRegister.click();
  }
}
