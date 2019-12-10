import { browser, by, element } from 'protractor';
import { AppPage } from './app.po';
import { PROGRAM, MENTOR, USER, SINGLE_PROGRAM_USER } from '../config';

describe('AppV2', () => {
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

  it('should display login if page is non-existence', () => {
    page.navigateTo('/non-existence');
    browser.waitForAngularEnabled().then(res => {
      browser.sleep(5000);
      const poweredBy = element(by.css('ion-content')).all(by.css('div')).last();
      expect(poweredBy.$('img').getAttribute('src')).toContain('/assets/logo.svg');
    });
  });

  it('should has logo', () => {
    page.navigateTo();
    browser.sleep(2000);
    browser.waitForAngularEnabled().then(res => {
      const test = page.containsClass('div-logo');
      expect(test).toBeTruthy();
    });
  });

  it('login button should disabled', () => {
    page.navigateTo();
    browser.sleep(2000);

    browser.waitForAngularEnabled().then(res => {
      const loginButton = page.loginButton();

      expect(loginButton.getText()).toEqual('LOGIN');
      expect(loginButton.getAttribute('disabled')).toBeTruthy();
    });
  });

  it('should login and select a program', () => {
    browser.executeScript('window.localStorage.clear();');
    page.navigateTo();
    browser.sleep(2000);
    browser.waitForAngularEnabled().then(res => {

      page.insertEmail();
      page.insertPassword();

      browser.sleep(3000);

      const loginButton = page.loginButton();
      expect(loginButton.getAttribute('disabled')).toBeFalsy();
      loginButton.click();

      // wait for experiences API request
      browser.sleep(5000);
      expect(page.getTitle()).toEqual('Select an experience');

      // available program should be more than 0
      const programs = element.all(by.css('ion-col'));
      expect(programs.count()).toBeGreaterThan(0);

      const firstProgram = programs.first();
      expect(firstProgram.getText()).toEqual(PROGRAM.name);
    });
  });

  it('should able to select first program', () => {
    page.navigateTo('/switcher/switcher-program');
    browser.sleep(3000);

    // available program should be more than 0
    const programs = element(by.css('app-switcher-program')).element(by.css('ion-content')).all(by.css('ion-col'));
    expect(programs.count()).toBeGreaterThan(0);
    const firstProgram = programs.first();
    expect(firstProgram.getText()).toEqual(PROGRAM.name);

    firstProgram.click();
    browser.sleep(8000);

    const navBarTitle = element(by.tagName('app-home')).element(by.css('ion-content')).element(by.css('h1'));
    expect(navBarTitle.getText()).toEqual(PROGRAM.name);

    element(by.css('ion-tab-bar')).all(by.css('ion-tab-button')).then(tabs => {
      expect(tabs[0].getText()).toContain('Home');
      expect(tabs[1].getText()).toEqual('Activities');
      expect(tabs[2].getText()).toContain('Chat');
      expect(tabs[3].getText()).toEqual('Settings');
    });
  });

  it('should display Page Not Found if page is non-existence', () => {
    page.navigateTo('/non-existence');
    browser.sleep(5000);
    element(by.css('ion-content')).all(by.css('div')).then(div => {
      expect(div[0].$('h1').getText()).toEqual('Page Not Found');

      // has backup button to go back to original content
      const goHomeBtn = div[1].element(by.css('ion-button'));
      expect(goHomeBtn.getAttribute('href')).toContain('/app/home');
      expect(goHomeBtn.getText()).toEqual('GO HOME');
    });
  });

  it('should be able to browse to different Home/Activities/Chat/Settings tab', () => {
    page.navigateTo('/app/home');
    browser.sleep(8000);

    element(by.css('ion-tab-bar')).all(by.css('ion-tab-button')).then(tabs => {
      const [home, activities, chat, settings] = tabs;

      expect(tabs.length).toBeGreaterThan(1);

      expect(home.getText()).toContain('Home');
      expect(activities.getText()).toContain('Activities');
      expect(chat.getText()).toContain('Chat');
      expect(settings.getText()).toContain('Settings');

      settings.click();
      browser.sleep(5000);
      expect(element(by.css('ion-title')).getText()).toEqual('Settings');
    });

    element(by.css('ion-tab-bar')).all(by.css('ion-tab-button')).then(tabs => {
      const [home, activities, chat, settings] = tabs;

      chat.click();
      browser.sleep(8000);

      const chatComponentHeaderBar = element(by.tagName('app-chat-list')).element(by.tagName('ion-header')).element(by.css('ion-toolbar'));
      expect(chatComponentHeaderBar.element(by.tagName('ion-title')).getText()).toEqual('Chat');
    });

    element(by.css('ion-tab-bar')).all(by.css('ion-tab-button')).then(tabs => {
      const [home, activities, chat, settings] = tabs;

      activities.click();
      browser.sleep(8000);
      const projectComponentHeaderBar = element(by.css('app-project')).element(by.css('ion-header')).element(by.css('ion-toolbar'));
      expect(projectComponentHeaderBar.element(by.css('ion-title')).getText()).toEqual(PROGRAM.name);
    });

    element(by.css('ion-tab-bar')).all(by.css('ion-tab-button')).then(tabs => {
      const [home, activities, chat, settings] = tabs;

      home.click();
      browser.sleep(5000);
      const homeComponentContent = element(by.css('app-home'));
      expect(homeComponentContent.element(by.css('h1')).getText()).toEqual(PROGRAM.name);
    });
  });

  it('should display proper info in setting page', () => {
    element(by.css('app-settings')).element(by.css('ion-content')).all(by.css('ion-card')).then(cards => {
      const [ profile, contact, support, logout ] = cards;
      expect(cards.length).toBeGreaterThan(1);
      // expect(profile.element(by.css('ion-item')).all(by.css('div')).first().all(by.css('div')).first().$('slot ion-label').getText()).toEqual(USER.name);
    });
  });

  it('should be able to go select program screen from settings page', () => {
    page.navigateTo('/app/settings');
    browser.sleep(2000);

    element(by.css('app-settings')).all(by.css('ion-card')).then(cards => {
      const [profile, contactNum] = cards;

      const switcher = contactNum.element(by.css('clickable-item')).element(by.css('ion-item'));
      switcher.click();

      browser.sleep(2000);
      expect(page.getTitle(element(by.css('app-switcher-program')))).toEqual('Select an experience');
    });
  });

  it('should able to browse between sub-pages inside project module', () => {
    page.navigateTo('/app/project');
    browser.sleep(10000);

    element.all(by.css('app-activity-card')).then(activities => {
      const [firstActivity] = activities;

      firstActivity.click();
      browser.sleep(5000);

      const activityPage = element(by.css('app-activity'));
      const activityPageHeader = activityPage.element(by.css('ion-header'));

      activityPage.all(by.css('ion-item')).then(tasks => {
        const [firstTask] = tasks;
        firstTask.click();
        browser.sleep(5000);

        const assessmentPage = element(by.css('app-assessment'));
        expect(assessmentPage.all(by.css('ion-title')).first().getText()).toEqual('Assessment');
        assessmentPage.element(by.css('ion-toolbar')).element(by.css('ion-icon')).click(); // go back
      });

      browser.sleep(5000);
      expect(activityPageHeader.element(by.css('ion-title')).getText()).toEqual('Activity');

      activityPage.all(by.css('ion-item')).then(tasks => {
        const [firstTask, secondTask] = tasks;
        secondTask.click();
        browser.sleep(5000);

        const assessmentPage = element(by.css('app-assessment'));
        expect(assessmentPage.all(by.css('ion-title')).first().getText()).toEqual('Assessment');
        assessmentPage.element(by.css('ion-toolbar')).element(by.css('ion-icon')).click(); // go back
      });

      browser.sleep(5000);
      expect(activityPageHeader.element(by.css('ion-title')).getText()).toEqual('Activity');

      activityPageHeader.element(by.css('ion-toolbar')).element(by.css('ion-icon')).click();
      browser.sleep(5000);

      expect(element(by.css('app-project')).element(by.css('ion-title')).getText()).toEqual(PROGRAM.name);
    });
  });

  it('should able to browse between sub-pages inside chat module', () => {
    page.navigateTo('/app/chat');
    browser.sleep(5000);

    const chatList = element(by.css('ion-list'));
    chatList.all(by.css('ion-item')).then(chatroom => {
      const [firstRoom, secondRoom] = chatroom;

      const chatUserName = firstRoom.element(by.css('ion-label')).element(by.css('div')).element(by.css('h2')).getText();
      firstRoom.click();
      browser.sleep(5000);

      const chatRoomUserName = element(by.css('app-chat-room')).element(by.css('ion-header')).element(by.css('ion-toolbar')).element(by.css('ion-title')).getText();
      expect(chatUserName).toEqual(chatRoomUserName);

      const input = element(by.css('textarea'));
      const dummyMessage = `Testing message from protractor: ${new Date()}`;
      input.sendKeys(dummyMessage);

      const sendMessageButton = element(by.css('ion-button[type="submit"]'));
      sendMessageButton.click();

      browser.sleep(3000);
      const messages = element(by.css('app-chat-room')).element(by.css('ion-content')).element(by.css('ion-list')).all(by.css('ion-item'));

      expect(messages.last().getText()).toContain(dummyMessage);

    });
  });

  it('should be able to logout', () => {
    page.navigateTo('/app/settings');
    browser.sleep(2000);

    const logoutBtn = element(by.css('app-settings')).all(by.css('ion-card')).last();
    logoutBtn.click();

    browser.sleep(3000);
    expect(element(by.css('app-auth')).element(by.css('ion-button')).getText()).toEqual('LOGIN');
  });

  it('should not display program switcher page for user enrolled to only one program', () => {
    browser.executeScript('window.localStorage.clear();');
    page.navigateTo('/');
    browser.sleep(3000);

    const loginPage = element(by.tagName('app-auth-login'));
    page.insertKeys('email', SINGLE_PROGRAM_USER.email, loginPage);
    page.insertKeys('password', SINGLE_PROGRAM_USER.password, loginPage);

    const loginBtn = page.loginButton();
    loginBtn.click();
    browser.sleep(8000);

    const homeComponent = element(by.css('app-home'));
    const tabBar = element(by.css('ion-tab-bar'));
    expect(homeComponent.isDisplayed()).toBeTruthy();
    expect(tabBar.isDisplayed()).toBeTruthy();
    const settingTab = tabBar.all(by.css('ion-tab-button')).last();
    settingTab.click();
    browser.sleep(5000);

    const logoutBtn = page.logoutButton();
    logoutBtn.click();
    browser.sleep(3000);
  });

  it('should show mentor tab menu normally and has one assessment to review', () => {
    browser.executeScript('window.localStorage.clear();');
    page.navigateTo('/');
    browser.sleep(3000);
    browser.waitForAngularEnabled().then(res => {
      page.loginAs(MENTOR);
      browser.sleep(8000);

      // select first program
      const programs = element(by.css('app-switcher-program')).all(by.css('ion-col'));
      expect(programs.count()).toBeGreaterThan(1);

      const firstProgram = programs.first();
      firstProgram.click();
      browser.sleep(8000);

      const tabBar = element(by.css('ion-tab-bar'));
      expect(tabBar.isDisplayed()).toBeTruthy();

      tabBar.all(by.css('ion-tab-button')).then(tabs => {
        const [home, activities, review, chat, settings] = tabs;
        expect(review.element(by.css('ion-label')).getText()).toContain('Review');
        review.click();
      });

      browser.sleep(5000);
      const reviewPage = element(by.css('app-reviews'));
      expect(reviewPage.element(by.css('ion-header')).element(by.css('ion-title')).getText()).toEqual('Reviews');
      expect(reviewPage.element(by.css('ion-content')).all(by.css('ion-card')).count()).toBeGreaterThan(0);
    });
  });
  // future test-case, prerequisites: database-reset
  // it('should be able to submit assessment', () => {});
});
