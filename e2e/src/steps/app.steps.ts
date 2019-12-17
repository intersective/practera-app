import { Given, When, Then } from 'cucumber';
const expect = global['chai'].expect;
import { AppPage } from '../page-objects/app.po';
import { REGISTRATION } from '../../config';

const page = new AppPage();

Given(/^I go to the (.+) page$/, pageType => {
  let route = '/';
  switch (pageType) {
    case 'home':
      route = '/app/home';
      break;
    case 'login':
      route = '/login';
      break;
  }
  return page.navigateTo(route);
});

Given(/^I go to the (.*)correct (.+) link$/, (incorrect, linkType) => {
  let route = '/';
  switch (linkType) {
    case 'registration':
      if (incorrect) {
        route = `/?do=registration&key=incorrect&email=incorrect@practera.com`;
      } else {
        route = `/?do=registration&key=${REGISTRATION[global['device']].key}&email=${REGISTRATION[global['device']].email}`;
      }
      break;
  }
  return page.navigateTo(route);
});

When(/^I click the (.+) tab$/, tabType => {
  return page.clickTab(tabType);
});

Then(/^I should be on the (.+) page$/, pageType => {
  let route = '/';
  switch (pageType) {
    case 'registration':
      route = '/registration';
      break;
    case 'login':
      route = '/login';
      break;
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

