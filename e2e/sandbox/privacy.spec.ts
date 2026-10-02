import { test } from '@playwright/test';
import { privateSmoke } from '../support/private-smoke';

test('synthetic live failure keeps private data out of artifacts', async ({ page }) => {
  test.fail();
  await privateSmoke(page, async stage => {
    stage('synthetic privacy probe');
    await page.setContent('<p>synthetic-private-learner</p>');
    await page.getByRole('button', { name: 'synthetic-live-token-must-not-persist' }).waitFor({ state: 'visible', timeout: 200 });
  });
});
