import { Given, When, Then } from 'cucumber';
const expect = global['chai'].expect;
import { LoginPage } from '../page-objects/login.po';

const loginPage = new LoginPage();

When(/^I fill in (.+) account$/, account => {
  let email, password;
  switch (account) {
    case 'incorrect':
      email = 'abc@practera.com';
      password = 'abc';
      break;
  }
  return loginPage.fillInAccount({
    email: email,
    password: password
  });
});

When(/^I click login button$/, () => {
  return loginPage.clickLogin();
});

Then(/^I should(.*) be able to click login button$/, not => {
  if (not) {
    return expect(loginPage.btnLogin.getAttribute('disabled')).to.eventually.equal('true');
  }
  return expect(loginPage.btnLogin.getAttribute('disabled')).to.eventually.be.null;
});

Then(/^I should see alert message$/, () => {
  return expect(loginPage.alertMsg.getText()).to.eventually.include('incorrect');
});

