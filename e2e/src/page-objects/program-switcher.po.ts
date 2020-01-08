import { browser, $, $$, Key, ExpectedConditions } from 'protractor';
import { AppPage } from './app.po';

export class ProgramSwitcherPage extends AppPage {
  parent = $('app-switcher-program');
  row = this.parent.$(`ion-row`);
  programCards = this.row.$$('ion-col');
  firstCard = this.row.$$('ion-col').get(0).$('ion-card');

  clickFirstCard() {
    return this.clickCard(0);
  }

  clickCard(i) {
    return this.programCards.get(i).$('ion-card').click();
  }

  waitUntilFirstCardClickable() {
    return this.wait(ExpectedConditions.elementToBeClickable(this.firstCard));
  }

}
