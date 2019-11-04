import { browser, by, element } from 'protractor';
import { AppPage } from './app.po';
import { PROGRAM } from '../config';

describe('Login Page', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display Page Not Found if page is non-existence', () => {
    page.navigateTo('/non-existence');
    expect(element(by.css('ion-content')).element(by.css('h1')).getText()).toEqual('Page Not Found');
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

  it('should be able to browse to different Home/Activities/Settings tab', () => {
    page.navigateTo('/app/home');

    element(by.css('ion-tab-bar')).all(by.css('ion-tab-button')).then(tabs => {
      expect(tabs[0].getText()).toEqual('Home');
      expect(tabs[1].getText()).toEqual('Activities');
      expect(tabs[2].getText()).toEqual('Settings');
    });
  });
});
