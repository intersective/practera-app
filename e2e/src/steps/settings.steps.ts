import { Given, When, Then } from 'cucumber';
const expect = global['chai'].expect;
import { SettingsPage } from '../page-objects/settings.po';

const page = new SettingsPage();

When(/^I click logout button$/, () => {
  return page.clickLogout();
});


