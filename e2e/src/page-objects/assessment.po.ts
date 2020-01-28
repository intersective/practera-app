import { browser, $, $$, Key, ExpectedConditions, by } from 'protractor';
import { AppPage } from './app.po';

export class AssessmentPage extends AppPage {
  parent = $('app-assessment');
  title = this.parent.$('h1');
  description = this.parent.$('#asmt-des p');
  dueDate = this.parent.$('p.due-date');
  questionCards = this.parent.$$('.question-card');
  btnBack = this.parent.$('ion-button#btn-back');
  btnCTA = this.parent.$('ion-button.btn-cta');

  getAssessmentName() {
    return this.title.getText();
  }

  getAssessmentDescription() {
    return this.description.getText();
  }

  getAssessmentDueDate() {
    return this.dueDate.getText();
  }

  /**
   * Get the question card element
   * @param i The index of the question
   */
  getQuestionCard(i: number) {
    return this.questionCards.get(i);
  }

  /**
   * Get the name of a question
   * @param questionCard The question card element
   */
  getQuestionName(questionCard) {
    return questionCard.$('.q-title').getText();
  }

  /**
   * Get the description of a question
   * @param questionCard The question card element
   */
  getQuestionDescription(questionCard) {
    return questionCard.$('.q-description p').getText();
  }

  /**
   * Click a choice of a question
   * @param questionCard The question card element
   * @param choiceIndex       The index of the choice
   */
  clickChoice(questionCard, choiceIndex: number) {
    return questionCard.$$('ion-item.choice-item').get(choiceIndex).click();
  }

  /**
   * Fill in the answer of a textarea
   * @param questionCard The question card element
   * @param answer       The content of the answer
   */
  fillInTextAnswer(questionCard, answer: string) {
    return questionCard.$('textarea').sendKeys(answer);
  }

  clickBackButton() {
    return this.btnBack.click();
  }

  clickCTAButton() {
    return this.btnCTA.click();
  }

}
