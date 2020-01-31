import { browser, $, $$, Key } from 'protractor';
import { AppPage } from './app.po';

export class SettingsPage extends AppPage {
  parent = $(`app-settings`);
  btnLogout = this.parent.$('#item-logout');

  clickLogout() {
    return this.btnLogout.click();
  }
}
