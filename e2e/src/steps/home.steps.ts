import { Given, When, Then } from 'cucumber';
const expect = global['chai'].expect;
import { HomePage } from '../page-objects/home.po';

const page = new HomePage();

Then(/^The program name should be "(.+)"$/, program => {
  return expect(page.getProgramName()).to.eventually.equal(program);
});

Then(/^The total progress should be "(.+)"$/, progress => {
  return expect(page.getProjectProgress()).to.eventually.equal(progress);
});

When(/^I click the view all button$/, () => {
  return page.clickViewAll();
});

When(/^I click on the badge number ([1-9]+)$/, index => {
  return page.clickBadge(index);
});

Then(/^The subtitle of todo card with title "(.+)" should be "(.+)"$/, (title, subtitle) => {
  return expect(page.getTodoCardSubtitle(title)).to.eventually.equal(subtitle);
});

When(/^I click the todo card with title "(.+)"$/, title => {
  return page.clickTodoCard(title);
});

Then(/^The name of milestone number "([0-9]+)" should be "(.+)"$/, (milestoneIndex, name) => {
  return expect(page.getMilestoneName(milestoneIndex)).to.eventually.equal(name);
});

Then(/^The description of milestone number "([0-9]+)" should be "(.+)"$/, (milestoneIndex, description) => {
  return expect(page.getMilestoneDescription(milestoneIndex)).to.eventually.equal(description);
});

Then(/^The milestone number "([0-9]+)" should be locked$/, milestoneIndex => {
  return expect(page.isMilestoneLocked(milestoneIndex)).to.be.true;
});

Then(/^The name of activity number "([0-9]+)" under milestone number "([0-9]+)" should be "(.+)"$/, (milestoneIndex, activityIndex, name) => {
  return expect(page.getActivityName(milestoneIndex, activityIndex)).to.eventually.equal(name);
});

Then(/^The activity number "([0-9]+)" under milestone number "([0-9]+)" should be locked$/, (milestoneIndex, activityIndex) => {
  return expect(page.isActivityLocked(milestoneIndex, activityIndex)).to.be.true;
});

When(/^I click the activity number "([0-9]+)" under milestone number "([0-9]+)"$/, (milestoneIndex, activityIndex) => {
  return page.clickActivityCard(milestoneIndex, activityIndex);
});
