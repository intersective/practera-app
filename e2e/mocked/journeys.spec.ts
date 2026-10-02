import { test, expect, login, openProgram, names, token } from '../support/mock-api';
import { taskButton } from '../support/controls';

test('redirects an unauthenticated learner to global login', async ({ page, api }) => {
  await page.goto('/v3/home');
  await expect(page).toHaveURL(/https:\/\/login\.e2e\.invalid\//);
  await expect(page.getByRole('heading', { name: 'Global login handoff' })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('referrer')).toBe('localhost');
});
test('processes a returned token, removes it from the URL and opens programs', async ({ page, api }) => {
  await login(page);
  expect(page.url()).not.toContain(token);
  expect(await page.evaluate(() => sessionStorage.getItem('pending_jwt_token'))).toBeNull();
  expect(api.operations.some(op => op.fields.includes('auth'))).toBe(true);
});
test('rejects an invalid token and returns to login', async ({ page, api }) => {
  await page.goto('/?token=e2e-invalid-token');
  await expect(page).toHaveURL(/https:\/\/login\.e2e\.invalid\//);
});
test('switches programs without retaining the previous program content', async ({ page, api }) => {
  await openProgram(page);
  await page.getByRole('button', { name: 'back to experience list' }).click();
  await page.getByRole('button', { name: names.second, exact: true }).click();
  await expect(page.getByRole('heading', { name: names.second, exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: names.first, exact: true })).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'E2E Research Activity', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: names.activity, exact: true })).not.toBeVisible();
});


test('opens an activity and reads a topic through the UI', async ({ page, api, isMobile }) => {
  await openProgram(page);
  await page.getByRole('button', { name: names.activity, exact: true }).click();
  if (isMobile) await taskButton(page, names.topic).click();
  await expect(page.getByText('Read this synthetic topic before completing your reflection.', { exact: true })).toBeVisible();
  expect(api.operations.some(op => op.fields.includes('topic') && Number(op.variables.id) === 401)).toBe(true);
});
test('logs out and blocks subsequent protected access', async ({ page, api }) => {
  await openProgram(page);
  await page.getByRole('banner', { name: 'home', exact: true }).getByRole('button', { name: 'Go to settings', exact: true }).click();
  await page.getByRole('button', { name: 'Log Out', exact: true }).click();
  await expect(page).toHaveURL(/https:\/\/login\.e2e\.invalid\//);
  await page.goto('/v3/home');
  await expect(page).toHaveURL(/https:\/\/login\.e2e\.invalid\//);
});
