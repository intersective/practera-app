import { browser, by, element } from 'protractor';
import { AppPage } from './app.po';
import { PROGRAM, USER } from '../config';

describe('Login Page', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display login if page is non-existence', () => {
    page.navigateTo('/non-existence');
    browser.ignoreSynchronization = true;
    browser.sleep(5000);
    const poweredBy = element(by.css('ion-content')).all(by.css('div')).last();
    expect(poweredBy.$('img').getAttribute('src')).toContain('/assets/logo.svg');
  });

  it('should has logo', () => {
    page.navigateTo();
    browser.sleep(2000);
    browser.ignoreSynchronization = true;
    const test = page.containsClass('div-logo');
    expect(test).toBeTruthy();
  });

  it('login button should disabled', () => {
    page.navigateTo();
    browser.sleep(2000);
    browser.ignoreSynchronization = true;
    const loginButton = page.loginButton();

    expect(loginButton.getText()).toEqual('LOGIN');
    expect(loginButton.getAttribute('disabled')).toBeTruthy();
  });

  it('should login and select a program', () => {
    page.navigateTo();
    browser.sleep(2000);
    browser.ignoreSynchronization = true;
    page.insertEmail();
    page.insertPassword();

    browser.sleep(1000);

    const loginButton = page.loginButton();
    expect(loginButton.getAttribute('disabled')).toBeFalsy();
    loginButton.click();

    // wait for experiences API request
    browser.sleep(3000);
    expect(page.getTitle()).toEqual('Select an experience');

    // available program should be more than 0
    const programs = element.all(by.css('ion-col'));
    expect(programs.count()).toBeGreaterThan(0);

    const firstProgram = programs.first();
    expect(firstProgram.getText()).toEqual(PROGRAM.name);
  });

  it('should able to select first program', () => {
    page.navigateTo('/switcher/switcher-program');

    // available program should be more than 0
    const programs = element.all(by.css('ion-col'));
    expect(programs.count()).toBeGreaterThan(0);
    const firstProgram = programs.first();
    expect(firstProgram.getText()).toEqual('Zaw Slider Test Program');

    firstProgram.click();
    browser.sleep(5000);

    const navBarTitle = element(by.css('app-home')).element(by.css('ion-content')).element(by.css('h1'));
    expect(navBarTitle.getText()).toEqual(PROGRAM.name);

    element(by.css('ion-tab-bar')).all(by.css('ion-tab-button')).then(tabs => {
      expect(tabs[0].getText()).toEqual('Home');
      expect(tabs[1].getText()).toEqual('Activities');
      expect(tabs[2].getText()).toEqual('Settings');
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

  it('should be able to browse to different Home/Activities/Settings tab', () => {
    page.navigateTo('/app/home');
    browser.sleep(2000);

    element(by.css('ion-tab-bar')).all(by.css('ion-tab-button')).then(tabs => {
      const [home, activities, settings] = tabs;
      expect(tabs.length).toBeGreaterThan(1);

      expect(home.getText()).toEqual('Home');
      expect(activities.getText()).toEqual('Activities');
      expect(settings.getText()).toEqual('Settings');

      settings.click();
      browser.sleep(2000);

      expect(element(by.css('ion-title')).getText()).toEqual('Settings');

      element(by.css('ion-content')).all(by.css('ion-card')).then(cards => {
        const [ profile, contact, support, logout ] = cards;
        expect(cards.length).toBeGreaterThan(1);

        // expect(profile.element(by.css('ion-item')).all(by.css('div')).first().all(by.css('div')).first().$('slot ion-label').getText()).toEqual(USER.name);
      });

    });
  });
});
