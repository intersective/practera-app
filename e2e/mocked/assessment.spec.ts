import { test, expect, names, openProgram } from '../support/mock-api';
import type { Page } from '@playwright/test';
import { taskButton } from '../support/controls';
async function openAssessment(page: Page) {
  await openProgram(page);
  await page.getByRole('button', { name: names.activity, exact: true }).click();
  await taskButton(page, names.assessment).click();
  await expect(page.getByRole('form', { name: 'Assessment form' })).toBeVisible();
}
function textInput(page: Page, name: string) {
  // Ionic iOS scroll assist temporarily clones textareas when opening the keyboard.
  return page.getByRole('textbox', { name, exact: true }).and(page.locator('textarea:not(.cloned-input)'));
}
async function answerText(page: Page, name: string, answer: string) {
  const input = textInput(page, name);
  await input.fill('');
  await input.pressSequentially(answer);
}
async function fillRequired(page: Page) {
  await answerText(page, 'Your reflection', 'I learned to test real behavior.');
  await page.getByRole('radio', { name: 'Research', exact: true }).click();
  await page.locator('ion-checkbox[aria-label="Design"]').scrollIntoViewIfNeeded();
  await page.getByRole('checkbox', { name: 'Design', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await answerText(page, 'Reflection 11', 'My next step is a reliable regression suite.');
}
test('prevents submission until required answers on both pages are complete', async ({ page, api }) => {
  await openAssessment(page);
  // The mobile layout hides disabled submit actions until validation succeeds.
  await expect(page.getByRole('button', { name: 'submit answers', exact: true, includeHidden: true })).toBeDisabled();
  await fillRequired(page);
  await expect(page.getByRole('button', { name: 'submit answers', exact: true })).toBeEnabled();
  expect(api.submitCount).toBe(0);
});
test('preserves answers through pagination and reloads confirmed saved drafts', async ({ page, api }) => {
  await openAssessment(page);
  await answerText(page, 'Your reflection', 'My saved reflection');
  await page.getByRole('radio', { name: 'Research', exact: true }).click();
  await page.locator('ion-checkbox[aria-label="Design"]').scrollIntoViewIfNeeded();
  await page.getByRole('checkbox', { name: 'Design', exact: true }).click();
  await expect.poll(() => Object.keys(api.answers).length).toBe(3);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await answerText(page, 'Reflection 11', 'My second-page answer');
  await expect.poll(() => api.answers[11]).toBe('My second-page answer');
  await page.getByRole('button', { name: 'Prev', exact: true }).click();
  await expect(textInput(page, 'Your reflection')).toHaveValue('My saved reflection');
  await expect(page.getByRole('radio', { name: 'Research', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Design', exact: true })).toBeChecked();
  await page.reload();
  await expect(textInput(page, 'Your reflection')).toHaveValue('My saved reflection');
  await expect(page.getByRole('radio', { name: 'Research', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Design', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(textInput(page, 'Reflection 11')).toHaveValue('My second-page answer');
});
test('retains an answer after failed autosave and retries it', async ({ page, api }) => {
  await openAssessment(page);
  api.failSave = true;
  await answerText(page, 'Your reflection', 'Keep this answer after failure');
  await expect(page.getByRole('button', { name: 'Retry save', exact: true })).toBeVisible();
  await expect(textInput(page, 'Your reflection')).toHaveValue('Keep this answer after failure');
  expect(api.answers[1]).toBeUndefined();
  api.failSave = false;
  await page.getByRole('button', { name: 'Retry save', exact: true }).click();
  await expect.poll(() => api.answers[1]).toBe('Keep this answer after failure');
  await expect(page.getByRole('button', { name: 'Retry save', exact: true })).not.toBeVisible();
});
test('submits the intended answers once and displays completion', async ({ page, api }) => {
  await openAssessment(page);
  await fillRequired(page);
  await page.getByRole('button', { name: 'submit answers', exact: true }).click();
  await expect.poll(() => api.submitted).toBe(true);
  expect(api.submitCount).toBe(1);
  const answers = api.submissions[0].answers as Array<{ questionId: number; answer: unknown }>;
  expect(answers).toEqual(expect.arrayContaining([
    { questionId: 1, answer: 'I learned to test real behavior.' },
    { questionId: 2, answer: 11 },
    { questionId: 3, answer: [22] },
    { questionId: 11, answer: 'My next step is a reliable regression suite.' },
  ]));
  await expect(page.getByRole('button', { name: 'continue', exact: true })).toBeVisible();
});
test('retains answers after submission fails and allows retry', async ({ page, api }) => {
  await openAssessment(page);
  await fillRequired(page);
  api.failSubmit = true;
  await page.getByRole('button', { name: 'submit answers', exact: true }).click();
  await expect(page.getByText('Submission failed. Please try again.', { exact: true })).toBeVisible();
  await expect(textInput(page, 'Reflection 11')).toHaveValue('My next step is a reliable regression suite.');
  await expect(page.getByRole('button', { name: 'submit answers', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'submit answers', exact: true }).click();
  await expect.poll(() => api.submitted).toBe(true);
  expect(api.submitCount).toBe(2);
});
