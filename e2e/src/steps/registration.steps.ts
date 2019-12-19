import { Given, When, Then } from 'cucumber';
const expect = global['chai'].expect;
import { RegistrationPage } from '../page-objects/registration.po';
import { REGISTRATION } from '../../config';

const page = new RegistrationPage();

Then(/^I should see registration (.+) pop up$/, text => {
  return expect(page.getPopupText()).to.eventually.include(text);
});

When(/^I click OK button of registration (.+) pop up/, async type => {
  await page.dismissPopup();
  if (type === 'success') {
    // wait until tab present if it is a success pop up
    return page.waitUntilTabPresent();
  }
  return page.sleep(500);
});

When(/^I click register button$/, async () => {
  await page.clickRegister();
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
      password = REGISTRATION[global['device']].password;
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
      password = REGISTRATION[global['device']].password;
      break;
  }
  return page.insertConfirmPassword(password);
});

Given(/^I click terms & conditions checkbox$/, () => {
  page.clickCheckbox();
});

