import { test } from '@playwright/test';
import { parse, getOperationAST } from 'graphql';
import { privateSmoke } from '../support/private-smoke';
import { taskButton } from '../support/controls';

// This suite never edits, autosaves, completes topics, or submits learner work.
test('sandbox token handoff and read-only learner navigation', async ({ page, context }) => {
  await privateSmoke(page, async stage => {
    const required = ['APP_TEST_TOKEN', 'APP_TEST_PROGRAM_NAME', 'APP_TEST_ACTIVITY_NAME', 'APP_TEST_TOPIC_NAME', 'APP_TEST_ASSESSMENT_NAME'] as const;
    for (const key of required) if (!process.env[key]) throw new Error(`Missing ${key}; use npm run test:sandbox after provisioning dedicated test data.`);
    await context.routeWebSocket(/.*/, socket => socket.close());
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.hostname === 'ipapi.co') return route.fulfill({ json: { country_code: 'AU' } });
      if (url.hostname === 'core-graphql-api.p2-sandbox.practera.com') {
        let readOnly = false;
        try {
          const body = request.postDataJSON();
          readOnly = getOperationAST(parse(body?.query || ''), body?.operationName)?.operation === 'query';
        }
        catch { return route.abort(); }
        if (!readOnly) return route.abort();
        return route.continue();
      }
      if (url.origin === 'http://localhost:4300' || url.hostname === 'admin.p2-sandbox.practera.com') {
        if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) return route.abort();
        return route.continue();
      }
      if (url.hostname === 'login-app.p2-sandbox.practera.com') return route.fulfill({ contentType: 'text/html', body: '<h1>Signed out</h1>' });
      // Local fonts/assets are sufficient; external integrations are out of scope.
      return route.abort();
    });
    await context.addInitScript(value => {
      if (location.pathname === '/auth/jwt') sessionStorage.setItem('pending_jwt_token', value);
    }, process.env.APP_TEST_TOKEN!);
    stage('token handoff');
    await page.goto('/auth/jwt');
    const program = process.env.APP_TEST_PROGRAM_NAME!;
    stage('program selection');
    await page.getByRole('button', { name: program, exact: true }).click();
    await page.getByRole('heading', { name: program, exact: true }).waitFor({ state: 'visible' });
    stage('activity access');
    await page.getByRole('button', { name: process.env.APP_TEST_ACTIVITY_NAME!, exact: true }).click();
    stage('topic access');
    await taskButton(page, process.env.APP_TEST_TOPIC_NAME!).click();
    await page.locator('app-topic:visible').waitFor({ state: 'visible' });
    stage('assessment loading');
    await taskButton(page, process.env.APP_TEST_ASSESSMENT_NAME!).click();
    await page.locator('app-assessment:visible').waitFor({ state: 'visible' });
    stage('logout');
    await page.getByRole('banner', { name: 'home', exact: true }).getByRole('button', { name: 'Go to settings', exact: true }).click();
    await page.getByRole('button', { name: 'Log Out', exact: true }).click();
    await page.getByRole('heading', { name: 'Signed out', exact: true }).waitFor({ state: 'visible' });
  });
});
