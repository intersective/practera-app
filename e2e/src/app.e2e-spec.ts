import { AppPage } from './app.po';

describe('Login Page', () => {
  let page: AppPage;
  beforeEach(() => {
    page = new AppPage();
  });

  it('login button should disabled', async () => {
    await page.navigateTo();
    expect(page.loginButton().getAttribute('disabled')).toBeTruthy();
  });

  it('should login', async () => {
    await page.navigateTo();
    expect(page.hasButton()).toEqual('LOGIN');
    await page.insertEmail();
    await page.insertPassword();
    const loginButton = page.loginButton();

    expect(loginButton.getAttribute('disabled')).toBeFalsy();
    loginButton.click();

    expect(page.getTitle()).toEqual('Select an Experience');
  });
});
