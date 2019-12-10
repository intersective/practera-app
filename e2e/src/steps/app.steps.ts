import { Given, When, Then } from 'cucumber';
const expect = global['chai'].expect;
import { AppPage } from '../page-objects/app.po';

const page = new AppPage();

Given(/^I go to the (.+) page$/, pageType => {
  let route = '/';
  switch (pageType) {
    case 'home':
      route = '/app/home';
      break;
  }
  return page.navigateTo(route);
});

When(/^I click the (.+) tab/, tabType => {
  return page.clickTab(tabType);
});

Then(/^I should be on the (.+) page$/, pageType => {
  let route = '/';
  switch (pageType) {
    case 'home':
      route = '/app/home';
      break;
    case 'program switcher':
      route = '/switcher/switcher-program';
      break;
    case 'settings':
      route = '/app/settings';
      break;
  }
  return expect(page.currentUrl()).to.eventually.include(route);
});

