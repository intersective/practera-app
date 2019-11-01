import { browser, by, element } from 'protractor';
import { AppPage } from './app.po';

describe('Login Page', () => {
  let page: AppPage;
  beforeEach(() => {
    page = new AppPage();
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

  it('should login', () => {
    page.navigateTo();
    browser.sleep(2000);
    browser.ignoreSynchronization = true;
    page.insertEmail();
    page.insertPassword();

    browser.sleep(500);

    const loginButton = page.loginButton();
    expect(loginButton.getAttribute('disabled')).toBeFalsy();
    loginButton.click();

    browser.sleep(2000);
    expect(page.getTitle()).toEqual('Select an experience');
  });
});
