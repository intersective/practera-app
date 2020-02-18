import { Given, When, Then } from 'cucumber';
const expect = global['chai'].expect;
import { ActivityPage } from '../page-objects/activity.po';

const page = new ActivityPage();

Then(/^The activity name should be "(.+)"$/, name => {
  return expect(page.getActivityName()).to.eventually.equal(name);
});

Then(/^The activity description should be "(.+)"$/, description => {
  return expect(page.getActivityDescription()).to.eventually.equal(description);
});

Then(/^The name of task number ([0-9]+) should be "(.+)"$/, (taskIndex, taskName) => {
  return expect(page.getTaskName(taskIndex)).to.eventually.equal(taskName);
});

Then(/^The due date of task number ([0-9]+) should be "(.+)"$/, (taskIndex, dueDate) => {
  return expect(page.getTaskDueDate(taskIndex)).to.eventually.equal(dueDate);
});

Then(/^The type status of task number ([0-9]+) should be "(.+)"$/, (taskIndex, typeStatus) => {
  return expect(page.getTaskTypeStatus(taskIndex)).to.eventually.equal(typeStatus);
});

When(/^I click on the task number ([1-9]+)$/, index => {
  return page.clickTask(index);
});

Then(/^The name of event number ([0-9]+) should be "(.+)" - \[activity page\]$/, (index, name) => {
  return expect(page.getEventName(index)).to.eventually.equal(name);
});

When(/^I click on the event number ([1-9]+) - \[activity page\]$/, index => {
  return page.clickEvent(index);
});
