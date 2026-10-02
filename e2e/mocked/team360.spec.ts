import { test, expect, openProgram, names } from '../support/mock-api';
import { openAssessment } from '../support/advanced-controls';
import { enterText, textarea, taskButton } from '../support/controls';
import { memberKeys } from '../support/advanced-fixtures';

test('caps Team360 peer pages by distinct members and keeps later self-reflection accessible', async ({ page, api }) => {
  api.options.scenario = 'team360'; api.options.team = true;
  await openAssessment(page);
  await expect(page.getByRole('heading', { name: 'General reflection', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Page \d+$/ })).toHaveCount(0);
  await expect(page.getByText('0 of 2 members reviewed', { exact: true })).toBeVisible();
  await enterText(page, 'General learning', 'I learned from my team.');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Peer review 1', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'submit answers', exact: true, includeHidden: true })).toBeDisabled();
  await page.getByRole('radio', { name: 'E2E Peer A', exact: true }).click();
  await expect.poll(() => api.answers[120]).toBe(memberKeys[0]);
  await expect(page.getByText('1 of 2 members reviewed', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Peer review 2', exact: true })).toBeVisible();
  await page.getByRole('checkbox', { name: 'E2E Peer B', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Self reflection', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Peer review overflow', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
  await enterText(page, 'My next step', 'Use the feedback in my next project.');
  await expect(page.getByRole('button', { name: 'submit answers', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Prev', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'E2E Peer B', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Prev', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'E2E Peer A', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Prev', exact: true }).click();
  await expect(textarea(page, 'General learning')).toHaveValue('I learned from my team.');
});

test('requires the first Team360 member section but allows an optional later section to remain empty', async ({ page, api }) => {
  api.options.scenario = 'team360'; api.options.team = true;
  await openAssessment(page);
  await enterText(page, 'General learning', 'General learning is complete.');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await enterText(page, 'My next step', 'Self reflection is complete.');
  await expect(page.getByRole('button', { name: 'submit answers', exact: true, includeHidden: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Prev', exact: true }).click();
  await page.getByRole('button', { name: 'Prev', exact: true }).click();
  await page.getByRole('radio', { name: 'E2E Peer A', exact: true }).click();
  await expect(page.getByRole('button', { name: 'submit answers', exact: true })).toBeEnabled();
  expect(api.answers[130]).toBeUndefined();
});

test('blocks Team360 entry with actionable guidance when the learner has no team', async ({ page, api }) => {
  api.options.scenario = 'team360';
  await openProgram(page);
  await page.getByRole('button', { name: names.activity, exact: true }).click();
  await taskButton(page, names.assessment).click();
  await expect(page.getByRole('alertdialog')).toContainText('Currently you are not in a team');
  await expect(page.getByRole('form', { name: 'Assessment form' })).toHaveCount(0);
  expect(api.operations.some(operation => operation.fields.includes('assessment'))).toBe(false);
});
