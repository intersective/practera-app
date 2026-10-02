import { test, expect } from '../support/mock-api';
import { openAssessment } from '../support/advanced-controls';
import { enterText } from '../support/controls';

async function submitAssessment(page: import('@playwright/test').Page) {
  await openAssessment(page);
  await enterText(page, 'Your reflection', 'My completed assessment reflection');
  await page.getByRole('radio', { name: 'Research', exact: true }).click();
  await page.locator('ion-checkbox[aria-label="Design"]').scrollIntoViewIfNeeded();
  await page.getByRole('checkbox', { name: 'Design', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await enterText(page, 'Reflection 11', 'Use feedback to improve');
  const feedbackResponse = page.waitForResponse(response => {
    if (!response.url().includes('graphql.e2e.invalid')) return false;
    return /query pulseCheck\(/.test(response.request().postDataJSON()?.query || '');
  });
  await page.getByRole('button', { name: 'submit answers', exact: true }).click();
  await (await feedbackResponse).finished();
}

test('opens one available post-assessment feedback modal and submits paginated answers to the intended target', async ({ page, api }) => {
  api.options.feedback = 'available';
  await submitAssessment(page);
  const modal = page.locator('app-fast-feedback');
  await expect(modal).toHaveCount(1);
  await expect(modal.getByText('Questions 1-3 of 4', { exact: true })).toBeVisible();
  await expect(modal.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
  const first = modal.getByRole('group', { name: 'Pulse question 7', exact: true });
  await first.getByRole('button', { name: 'Show details for On track', exact: true }).click();
  await expect(first.getByText('The project is progressing as expected.', { exact: true })).toBeVisible();
  await expect(first.getByRole('radio', { name: 'On track', exact: true })).not.toBeChecked();
  for (const id of [7, 8, 9]) await modal.getByRole('radiogroup', { name: `Pulse question ${id}`, exact: true }).getByRole('radio', { name: 'On track', exact: true }).click();
  await modal.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(modal.getByText('Questions 4-4 of 4', { exact: true })).toBeVisible();
  await expect(modal.getByRole('button', { name: 'Submit', exact: true })).toBeDisabled();
  await modal.getByRole('radiogroup', { name: 'Pulse question 20', exact: true }).getByRole('radio', { name: 'On track', exact: true }).click();
  await modal.getByRole('button', { name: 'Previous', exact: true }).click();
  await expect(modal.getByRole('radiogroup', { name: 'Pulse question 7', exact: true }).getByRole('radio', { name: 'On track', exact: true })).toBeChecked();
  await modal.getByRole('button', { name: 'Next', exact: true }).click();
  await modal.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect.poll(() => api.pulseSubmissions.length).toBe(1);
  expect(api.pulseSubmissions[0]).toEqual({ contextId: 601, teamId: 2001, targetUserId: null, answers: [
    { questionId: 7, choiceId: 1 }, { questionId: 8, choiceId: 1 }, { questionId: 9, choiceId: 1 }, { questionId: 20, choiceId: 1 },
  ] });
  await expect(modal).toHaveCount(0);
  expect(api.submitCount).toBe(1);
});

for (const response of ['none', 'missing-meta'] as const) {
  test(`keeps completion available without opening a feedback modal for ${response} response`, async ({ page, api }) => {
    // Enable the assessment hook even when the backend reports no available questions.
    api.options.feedback = response === 'none' ? 'available' : response;
    if (response === 'none') api.pulseSubmitted = true;
    await submitAssessment(page);
    await expect(page.getByRole('button', { name: 'continue', exact: true })).toBeVisible();
    await expect(page.locator('app-fast-feedback')).toHaveCount(0);
    expect(api.submitCount).toBe(1);
  });
}
