import { browser, by, element } from 'protractor';
import { AppPage } from './app.po';
import { REGISTRATION } from '../config';

xdescribe('AppV2-Registration', () => {
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

  REGISTRATION.forEach(reg => {
    const { email, key, password } = reg;
    it(`should be able to register ${email}`, () => {
      page.navigateTo(`/?do=registration&key=${key}&email=${email}`);
      browser.waitForAngularEnabled().then(res => {
        browser.sleep(8000);

        const regPage = element(by.css('app-auth-registration'));
        const formContent = regPage.element(by.css('.div-after-logo'));
        expect(formContent.element(by.css('p')).getText()).toEqual(email);

        page.insertKeys('password', password, regPage);
        page.insertKeys('confirmPassword', password, regPage);
        regPage.element(by.css('ion-checkbox')).click();
        expect(regPage.element(by.css('form')).element(by.css('ion-button')).isEnabled()).toBeTruthy();

        regPage.element(by.css('form')).element(by.buttonText('REGISTER')).click();

        browser.sleep(5000);
        const popup = element(by.css('ion-modal')).element(by.css('app-pop-up'));
        expect(popup.element(by.css('.div-after-logo')).element(by.css('p')).getText()).toEqual('Registration success!');

        popup.element(by.buttonText('OK')).click();
        browser.sleep(5000);

        expect(element(by.css('app-switcher-program')).element(by.css('ion-header')).element(by.css('ion-title')).getText()).toEqual('Select an experience');
      });
    });
  });

  it('should prevent invalid registration', () => {
    const email = 'protractor@test.com';
    page.navigateTo(`/?do=registration&key=invalid&email=${email}`);
    element(by.buttonText('REGISTER')).click();
  });
});
