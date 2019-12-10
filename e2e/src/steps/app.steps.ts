import { Given, When, Then } from 'cucumber';
const expect = global['chai'].expect;
import { AppPage } from '../page-objects/app.po';

const appPage = new AppPage();

Given(/^I go to the (.+) page$/, page => {
  let route = '/';
  switch (page) {
    case 'home':
      route = '/home';
      break;
  }
  return appPage.navigateTo(route);
});

Then(/^I should be on the (.+) page$/, page => {
  let route = '/';
  switch (page) {
    case 'home':
      route = '/home';
      break;
    case 'program switcher':
      route = '/switcher/switcher-program';
  }
  return expect(appPage.currentUrl()).to.eventually.include(route);
});

