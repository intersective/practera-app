import { browser, $, $$, Key, ExpectedConditions, by } from 'protractor';
import { AppPage } from './app.po';

export class FastFeedbackPage extends AppPage {
  parent = $('app-fast-feedback');
  questions = this.parent.$$('question');
  btnSubmit = this.parent.$('ion-button.btn-cta');

  /**
   * Get the name of a question
   * @param i The index of the question
   */
  getQuestionName(i: number) {
    return this.questions.get(i).$('.q-title').getText();
  }

  /**
   * Click a choice of a question
   * @param i The index of the question
   * @param choiceIndex    The index of the choice
   */
  clickChoice(i: number, choiceIndex: number) {
    return this.questions.get(i).$$('ion-item').get(choiceIndex).click();
  }

  clickSubmitButton() {
    return this.btnSubmit.click();
  }

}
