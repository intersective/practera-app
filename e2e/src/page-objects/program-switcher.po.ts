import { browser, $, $$, Key, ExpectedConditions } from 'protractor';
import { AppPage } from './app.po';

export class ProgramSwitcherPage extends AppPage {
  parent = $('app-switcher-program');
  row = this.parent.$(`ion-row`);
  firstCard = this.row.$$('ion-col').get(0).$('ion-card');

  clickFirstCard() {
    return this.firstCard.click();
  }
  waitUntilFirstCardClickable() {
    return this.wait(ExpectedConditions.elementToBeClickable(this.firstCard));
  }

}
