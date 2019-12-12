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

  it('should login and redirect to home screen', () => {
    page.navigateTo();
    browser.executeScript('window.localStorage.clear();');
    page.navigateTo('/');
    browser.sleep(2000);
    browser.waitForAngularEnabled().then(res => {
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
    });
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

  it('should navigate to project if all task is completed in an activity', () => {
    page.navigateTo('/app/project');
    browser.sleep(3000);

    // project screen
    const projectScreen = element(by.css('app-project'));
    const milestoneList = projectScreen.element(by.css('ion-content')).element(by.css('ion-list'));
    milestoneList.all(by.css('ion-item')).then(milestones => {
      const [first, second] = milestones;

      // first milestone: 1
      expect(first.element(by.css('ion-text')).getText()).toEqual('1');
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
          browser.sleep(8000);
        });

        // task screen
        const assessment = element(by.css('app-assessment'));
        expect(assessment.isDisplayed()).toBeTruthy();
        expect(assessment.element(by.css('h1')).getText()).toEqual('Assessment 1');
        const continueBtn = assessment.element(by.tagName('ion-footer')).element(by.tagName('ion-toolbar')).element(by.tagName('ion-button'));
        continueBtn.click();
        browser.sleep(5000);

        // back to project
        expect(projectScreen.isDisplayed()).toBeTruthy();
      });
    });
  });

  it('should navigate to next unfinished task by the order of task', () => {
    page.navigateTo('/app/project');
    browser.sleep(5000);

    // project screen
    const projectScreen = element(by.css('app-project'));
    projectScreen.all(by.css('ion-content > ion-list > ion-item')).then(milestones => {
      const [first, second] = milestones;

    // second milestone: 2
      expect(second.element(by.css('.project-title')).getText()).toEqual('2');
      second.all(by.css('ion-list > ion-item')).then(activities => {
        const [firstActivity] = activities;

        firstActivity.click();
        browser.sleep(5000);

        const activity = element(by.css('app-activity'));
        expect(activity.isDisplayed()).toBeTruthy();

    // finishing up first task
        activity.element(by.css('ion-content')).element(by.css('ion-card')).all(by.css('ion-item')).then(tasks => {
          const [firstTask] = tasks;
          firstTask.click();
          browser.sleep(5000);
        });

    // 1st task screen
        const assessment = element(by.css('app-assessment'));
        expect(assessment.isDisplayed()).toBeTruthy();
        expect(assessment.element(by.css('h1')).getText()).toEqual('Milestone 2: Activity 1');
        const continueBtn = assessment.element(by.tagName('ion-footer')).element(by.tagName('ion-toolbar')).element(by.tagName('ion-button'));
        continueBtn.click();
        // page.submitAssessment(assessment);
        browser.sleep(8000);

    // 2nd task screen
        /*element.all(by.css('app-assessment')).then(asmts => {
          expect(asmts.length).toBeGreaterThan(1);

          const [last, latest] = asmts;
          // const latest = element(by.css('app-assessment'));
          expect(latest.isDisplayed()).toBeTruthy();
          expect(latest.element(by.css('h1')).getText()).toEqual('Milestone 2: Activity 2');
          page.submitAssessment(latest);
          browser.sleep(8000);
        });*/

    // 3rd task screen
        const topic = element(by.css('app-topic'));
        expect(topic.isDisplayed()).toBeTruthy();
        expect(topic.element(by.css('h3')).getText()).toEqual('Milestone 2: Topic 3');
      });

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

  it('should redirect user back to project page for last task in an activity', () => {
    page.navigateTo('/app/project');
    browser.sleep(3000);

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
          const [firstTask, secondTask, thirdTask] = tasks;
          thirdTask.click();
          browser.sleep(6000);
        });

        // last task screen
        const assessment = element(by.css('app-assessment'));
        expect(assessment.isDisplayed()).toBeTruthy();
        expect(assessment.element(by.css('h1')).getText()).toEqual('Assessment 3'); // last task
        const continueBtn = assessment.element(by.tagName('ion-footer')).element(by.tagName('ion-button'));
        continueBtn.click();
        browser.sleep(5000);

        // back to project
        expect(projectScreen.isDisplayed()).toBeTruthy();
      });
    });
  });
});
