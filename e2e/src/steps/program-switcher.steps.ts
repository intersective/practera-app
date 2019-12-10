import { Given, When, Then } from 'cucumber';
const expect = global['chai'].expect;
import { ProgramSwitcherPage } from '../page-objects/program-switcher.po';
import { HomePage } from '../page-objects/home.po';
import { CORRECT_ACCOUNT } from '../../config';

const page = new ProgramSwitcherPage();

When(/^I choose (.+) program$/, program => {
  switch (program) {
    case 'first':
      page.clickFirstCard();
      break;
  }
  return page.sleep(1000);
});


