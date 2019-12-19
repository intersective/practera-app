import { Given, When, Then } from 'cucumber';
const expect = global['chai'].expect;
import { ProgramSwitcherPage } from '../page-objects/program-switcher.po';
import { HomePage } from '../page-objects/home.po';

const page = new ProgramSwitcherPage();

When(/^I choose (.+) program$/, async program => {
  switch (program) {
    case 'first':
      await page.waitUntilFirstCardClickable();
      await page.clickFirstCard();
      break;
  }
  return page.waitUntilTabPresent();
});


