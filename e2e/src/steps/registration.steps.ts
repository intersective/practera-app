import { Given, When, Then } from 'cucumber';
const expect = global['chai'].expect;
import { RegistrationPage } from '../page-objects/registration.po';
import { REGISTRATION } from '../../config';

const page = new RegistrationPage();

Then(/^I should see registration link invalid pop up$/, () => {
  return expect(page.getLinkInvalidPopupText()).to.eventually.include('invalid');
});

When(/^I click OK button of registration link invalid pop up/, () => {
  page.dismissLinkInvalidPopup();
  return page.sleep(500);
});

When(/^I click register button$/, () => {
  page.clickRegister();
  return page.sleep(500);
});

Then(/^I should see "(.+)" error in registration form$/, msg => {
  return expect(page.getFormErrorText()).to.eventually.include(msg);
});

When(/^I fill in (.+) password in registration form$/, passwordType => {
  let password = '';
  switch (passwordType) {
    case 'short':
      password = '123';
      break;
    case 'correct':
      password = REGISTRATION.password;
      break;
  }
  return page.insertPassword(password);
});

When(/^I confirm (.+) password in registration form$/, passwordType => {
  let password = '';
  switch (passwordType) {
    case 'incorrect':
      password = '123';
      break;
    case 'correct':
      password = REGISTRATION.password;
      break;
  }
  return page.insertConfirmPassword(password);
});
