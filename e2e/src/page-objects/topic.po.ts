import { browser, $, $$, Key, ExpectedConditions, by } from 'protractor';
import { AppPage } from './app.po';

export class TopicPage extends AppPage {
  parent = $('app-topic');
  title = this.parent.$('h3');
  content = this.parent.$('ion-card-content');
  btnBack = this.parent.$('ion-button#btn-back');
  btnContinue = this.parent.$('ion-button.btn-cta');

  getTopicName() {
    return this.title.getText();
  }

  getTopicContent() {
    return this.content.getText();
  }

  clickBackButton() {
    return this.btnBack.click();
  }

  clickContinueButton() {
    return this.btnContinue.click();
  }

}
