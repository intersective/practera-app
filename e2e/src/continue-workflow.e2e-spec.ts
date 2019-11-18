import { browser, by, element } from 'protractor';
import { AppPage } from './app.po';
import { PROGRAM, MENTOR, USER, CONTINUE_WORKFLOW_USER } from '../config';

describe('AppV2 - Continue workflow', () => {
  let page: AppPage;
  let originalTimeout: number;

  beforeEach(() => {
    page = new AppPage();
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
  });

  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  it('should login and select a program', () => {
    page.navigateTo('/');
    browser.sleep(2000);
    browser.ignoreSynchronization = true;
    page.insertEmail(CONTINUE_WORKFLOW_USER.email);
    page.insertPassword(CONTINUE_WORKFLOW_USER.password);

    browser.sleep(1000);

    const loginButton = page.loginButton();
    expect(loginButton.getAttribute('disabled')).toBeFalsy();
    loginButton.click();

    // wait for experiences API request
    browser.sleep(8000);
    const homeComponentContent = page.getHomeScreen();
    expect(homeComponentContent.element(by.css('h1')).getText()).toEqual(PROGRAM.name);

    // // available program should be more than 0
    // const programs = element.all(by.css('ion-col'));
    // expect(programs.count()).toBeGreaterThan(0);

    // const firstProgram = programs.first();
    // expect(firstProgram.getText()).toEqual(PROGRAM.name);
  });

  it('should browse into project tab', () => {
    page.navigateTo('/');
    browser.sleep(3000);

    page.getTabs().then(tabs => {
      const [ home, project, settings ] = tabs;
      expect(project.getText()).toEqual('Activities');
      project.click();
      browser.sleep(5000);
      expect(page.projectPageTitle().getText()).toEqual(PROGRAM.name);
    });
  });

  it('should navigate to next task by the sequence of API', () => {
    page.navigateTo('/app/project');
    browser.sleep(3000);

    // project screen
    const projectScreen = element(by.css('app-project'));
    const milestoneList = projectScreen.element(by.css('ion-content')).element(by.css('ion-list'));
    milestoneList.all(by.css('ion-item')).then(milestones => {
      const [first, seconds] = milestones;

      first.element(by.css('ion-list')).all(by.css('ion-item')).then(activities => {
        const [ firstActivity, secondActivity ] = activities;

        firstActivity.click();
        browser.sleep(5000);
    // activity screen
        const activity = element(by.css('app-activity'));
        expect(activity.isDisplayed()).toBeTruthy();

        activity.element(by.css('ion-content')).element(by.css('ion-card')).all(by.css('ion-item')).then(tasks => {
          const [firstTask] = tasks;
          firstTask.click();
          browser.sleep(3000);
        });

        // task screen
        const assessment = element(by.css('app-assessment'));
        expect(assessment.isDisplayed()).toBeTruthy();
        expect(assessment.element(by.css('h1')).getText()).toEqual('Assessment 1');
        const continueBtn = assessment.element(by.tagName('ion-footer')).element(by.css('ion-button'));
        continueBtn.click();
        browser.sleep(5000);

        // back to project
        expect(projectScreen.isDisplayed()).toBeTruthy();

    // for undone
    /**
    // 1st task screen
        let assessment = element(by.css('app-assessment'));
        expect(assessment.isDisplayed()).toBeTruthy();
        expect(assessment.element(by.css('h1')).getText()).toEqual('Assessment 1');
        let continueBtn = assessment.element(by.tagName('ion-footer')).element(by.css('ion-button'));
        continueBtn.click();
        browser.sleep(5000);

    // 2nd task screen
        assessment = element(by.css('app-assessment'));
        expect(assessment.isDisplayed()).toBeTruthy();
        expect(assessment.element(by.css('h1')).getText()).toEqual('Assessment 2');
        continueBtn = assessment.element(by.tagName('ion-footer')).element(by.css('ion-button'));
        continueBtn.click();
        browser.sleep(5000);

    // 3rd task screen
        assessment = element(by.css('app-assessment'));
        expect(assessment.isDisplayed()).toBeTruthy();
        expect(assessment.element(by.css('h1')).getText()).toEqual('Assessment 3');
        continueBtn = assessment.element(by.tagName('ion-footer')).element(by.css('ion-button'));
        continueBtn.click();
        browser.sleep(5000);
    **/

      });
    });
  });

  it('should redirect user back to project page for last task in an activity', () => {
    const projectScreen = element(by.css('app-project'));
    const milestoneList = projectScreen.element(by.css('ion-content')).element(by.css('ion-list'));

    milestoneList.all(by.css('ion-item')).then(milestones => {
      const [first, seconds] = milestones;

      first.element(by.css('ion-list')).all(by.css('ion-item')).then(activities => {
        const [ firstActivity, secondActivity, lastActivity ] = activities;

        firstActivity.click();
        browser.sleep(5000);
    // activity screen
        const activity = element(by.css('app-activity'));
        expect(activity.isDisplayed()).toBeTruthy();

        activity.element(by.css('ion-content')).element(by.css('ion-card')).all(by.css('ion-item')).then(tasks => {
          const [firstTask, secondTask, lastTask] = tasks;
          lastTask.click();
          browser.sleep(3000);
        });

        // last task screen
        const assessment = element(by.css('app-assessment'));
        expect(assessment.isDisplayed()).toBeTruthy();
        expect(assessment.element(by.css('h1')).getText()).toEqual('Assessment 1');
        const continueBtn = assessment.element(by.tagName('ion-footer')).element(by.css('ion-button'));
        continueBtn.click();
        browser.sleep(5000);

        // back to project
        expect(projectScreen.isDisplayed()).toBeTruthy();
      });
    });
  });
});
