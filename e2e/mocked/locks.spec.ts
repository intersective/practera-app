import { test, expect, openProgram, names } from '../support/mock-api';

test('shows locked milestone guidance and reaches a prerequisite topic without unlocking the target', async ({ page, api }) => {
  api.options.locks = 'linked';
  await openProgram(page);
  await page.getByLabel('E2E Locked Milestone (locked)', { exact: true }).click();
  const popup = page.locator('app-pop-up');
  await expect(popup).toContainText('Please follow the steps below to unlock this milestone:');
  await expect(popup.getByText(`Complete ${names.topic}`, { exact: true })).toBeVisible();
  await popup.getByText(`Complete ${names.topic}`, { exact: true }).click();
  await expect(page.getByText('Read this synthetic topic before completing your reflection.', { exact: true })).toBeVisible();
  expect(api.operations.some(operation => operation.fields.includes('activity') && operation.variables.id === 302)).toBe(false);
});
test('shows locked activity guidance and reaches the assessment prerequisite', async ({ page, api }) => {
  api.options.locks = 'linked';
  await openProgram(page);
  await page.getByRole('button', { name: 'E2E Locked Activity', exact: true }).click();
  const popup = page.locator('app-pop-up');
  await expect(popup).toContainText('Please follow the steps below to unlock this activity:');
  await popup.getByText(`Submit ${names.assessment}`, { exact: true }).click();
  await expect(page.getByRole('form', { name: 'Assessment form' })).toBeVisible();
  expect(api.operations.some(operation => operation.fields.includes('activity') && operation.variables.id === 302)).toBe(false);
});
for (const mode of ['unsupported', 'mixed', 'missing'] as const) {
  test(`keeps locked activity inaccessible with complete fallback for ${mode} conditions`, async ({ page, api }) => {
    api.options.locks = mode;
    await openProgram(page);
    await page.getByRole('button', { name: 'E2E Locked Activity', exact: true }).click();
    const popup = page.locator('app-pop-up');
    await expect(popup).toContainText('You have not yet met the requirements to unlock this activity.');
    await expect(popup.locator('ol')).toHaveCount(0);
    await popup.getByRole('button', { name: 'OK', exact: true }).click();
    await expect(page.getByRole('heading', { name: names.first, exact: true })).toBeVisible();
    expect(api.operations.some(operation => operation.fields.includes('activity'))).toBe(false);
  });
}
