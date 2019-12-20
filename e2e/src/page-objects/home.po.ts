import { browser, $, $$, Key, ExpectedConditions } from 'protractor';
import { AppPage } from './app.po';

export class HomePage extends AppPage {
  parent = $('app-overview-routing');
  home = this.parent.$('app-home');
  textProgramName = this.parent.$('ion-title');
  textProjectProgress = this.home.$('app-cicle-progress').$$('tspan').get(0);
  btnAchievementAll = this.home.$('.achievement').$('a');

  getProgramName() {
    return this.textProgramName.getText();
  }

  getProjectProgress() {
    return this.textProjectProgress.getText();
  }

  clickViewAll() {
    return this.btnAchievementAll.click();
  }
}
