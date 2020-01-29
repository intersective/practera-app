import { Given, When, Then } from 'cucumber';
const expect = global['chai'].expect;
import { FastFeedbackPage } from '../page-objects/fast-feedback.po';

const page = new FastFeedbackPage();

Then(/^\[pulse check\] The question name of question ([0-9]+) should be "(.+)"$/, (i, name) => {
  return expect(page.getQuestionName(i - 1)).to.eventually.include(name);
});

When(/^\[pulse check\] I choose choice ([0-9]+) of question ([0-9]+)$/, (choiceIndex, questionIndex) => {
  return page.clickChoice(questionIndex - 1, choiceIndex - 1);
});

When(/^\[pulse check\] I click submit button$/, () => {
  return page.clickSubmitButton();
});
