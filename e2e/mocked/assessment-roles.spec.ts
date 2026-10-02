import { test, expect, openProgram, names, type MockState } from '../support/mock-api';
import { openAssessment } from '../support/advanced-controls';
import { enterText, textarea } from '../support/controls';
import type { Page } from '@playwright/test';

function seedLearner(api: MockState) {
  api.answers = { 101: 'Learner work that must remain unchanged', 103: [1031] };
}
async function selectReview(page: Page) {
  await page.locator('app-review-list').getByRole('button').filter({ has: page.getByRole('heading', { name: names.assessment, exact: true }) }).click();
  await expect(page.getByRole('form', { name: 'Assessment form' })).toBeVisible();
}
async function openReview(page: Page, completed = false) {
  await openProgram(page);
  if (page.viewportSize()!.width >= 768) {
    await page.getByRole('navigation', { name: 'menu', exact: true }).getByRole('link', { name: 'Reviews', exact: true }).click();
  } else {
    await page.getByRole('tab', { name: 'Reviews', exact: true }).click();
  }
  if (completed) {
    await page.locator('ion-segment-button[value=completed]').click();
    await expect(page.getByRole('tab', { name: 'Completed', exact: true })).toHaveAttribute('aria-selected', 'true');
  }
  await selectReview(page);
}
test('hides reviewer-only groups from a learner draft and exposes participant navigation', async ({ page, api }) => {
  api.options.scenario = 'roles';
  await openAssessment(page);
  await expect(page.getByRole('heading', { name: 'Learner responses', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Reviewer criteria A', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Reviewer criteria B', exact: true })).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Learner reflection', exact: true })).toBeEditable();
  await expect(page.getByLabel('Reviews', { exact: true }).filter({ visible: true })).toHaveCount(0);
  await expect(page.getByLabel('Events', { exact: true }).filter({ visible: true })).toBeVisible();
});
test('keeps unpublished reviewer answers and comments out of a pending learner view', async ({ page, api }) => {
  api.options.scenario = 'roles'; api.options.status = 'pending review'; seedLearner(api);
  api.reviewAnswers = { 201: { answer: 'PRIVATE unpublished recommendation' }, 101: { comment: 'PRIVATE unpublished comment' } };
  await openAssessment(page);
  await expect(page.locator('#q-101')).toContainText('Learner work that must remain unchanged');
  await expect(page.getByText(/PRIVATE unpublished/)).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Reviewer criteria A', exact: true })).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Learner reflection', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'submit answers', exact: true })).toHaveCount(0);
});
test('appends published reviewer-only criteria once and displays their answers without learner ownership', async ({ page, api }) => {
  api.options.scenario = 'roles'; api.options.status = 'published'; api.reviewDone = true; seedLearner(api);
  api.reviewAnswers = { 201: { answer: 'Published recommendation' }, 103: { answer: [1032] }, 203: { answer: 2031 } };
  await openAssessment(page);
  await expect(page.getByRole('heading', { name: 'Reviewer Feedback', exact: true })).toHaveCount(1);
  const headings = await page.getByRole('form', { name: 'Assessment form' }).locator('[id^=group-heading-], #reviewer-feedback-heading').allTextContents();
  expect(headings).toEqual(['Learner responses', 'Shared responses', 'Reviewer Feedback', 'Reviewer criteria A', 'Reviewer criteria B']);
  await expect(page.locator('#q-201')).toContainText('Published recommendation');
  await expect(page.locator('#q-201').getByText('Your Answer', { exact: true })).toHaveCount(0);
  await expect(page.locator('#q-202')).toContainText('No reviewer answer provided');
  await expect(page.locator('#q-203')).toContainText('Ready');
  await expect(page.locator('#q-103')).toContainText('Your Answer');
  await expect(page.locator('#q-103')).toContainText("Reviewer's Answer");
  await expect(page.getByRole('region', { name: 'Reviewer information' })).toContainText('E2E Reviewer');
  expect(api.operations.some(operation => operation.fields.includes('saveSubmissionAnswer'))).toBe(false);
});
test('lets a pending reviewer edit only permitted answers and comments while preserving learner work', async ({ page, api }) => {
  api.options.scenario = 'roles'; api.options.role = 'mentor'; api.options.team = true;
  api.options.status = 'pending review'; seedLearner(api);
  await openReview(page);
  await expect(page.getByLabel('Events', { exact: true }).filter({ visible: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Reviewer-only questions', exact: true })).toHaveCount(2);
  await expect(page.locator('#q-101')).toContainText('Learner work that must remain unchanged');
  await expect(page.locator('#q-101').getByRole('textbox', { name: "Reviewer's answer", exact: true })).toHaveCount(0);
  await enterText(page, "Reviewer's answer", 'A careful recommendation');
  await enterText(page, 'Expert review feedback', 'Specific feedback for this learner');
  await expect.poll(() => api.reviewAnswers[201]?.answer).toBe('A careful recommendation');
  await expect.poll(() => api.reviewAnswers[101]?.comment).toBe('Specific feedback for this learner');
  await page.reload();
  if (page.viewportSize()!.width >= 768) await selectReview(page);
  await expect(textarea(page, 'Expert review feedback')).toHaveValue('Specific feedback for this learner');
  expect(api.answers[101]).toBe('Learner work that must remain unchanged');
  expect(api.operations.some(operation => operation.fields.includes('saveSubmissionAnswer'))).toBe(false);
});
test('opens completed reviewer work read-only', async ({ page, api }) => {
  api.options.scenario = 'roles'; api.options.role = 'mentor'; api.options.team = true;
  api.options.status = 'published'; api.reviewDone = true; seedLearner(api);
  api.reviewAnswers = { 201: { answer: 'Completed recommendation' }, 203: { answer: 2031 } };
  await openReview(page, true);
  await expect(page.locator('#q-201')).toContainText('Completed recommendation');
  await expect(page.getByRole('textbox', { name: "Reviewer's answer", exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'submit review', exact: true })).toHaveCount(0);
  expect(api.operations.some(operation => operation.fields.includes('saveReviewAnswer'))).toBe(false);
});
test('disables learner edits while a submission is locked by another team member', async ({ page, api }) => {
  api.options.scenario = 'roles'; api.options.locked = true; api.options.team = true;
  await openAssessment(page);
  await expect(page.getByRole('alert')).toContainText('Locked by E2E Peer A');
  await expect(page.getByRole('textbox', { name: 'Learner reflection', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'submit answers', exact: true, includeHidden: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'continue', exact: true, includeHidden: true })).toBeDisabled();
  expect(api.operations.some(operation => operation.fields.includes('saveSubmissionAnswer'))).toBe(false);
});

test('counts only visible learner questions across draft pages and retains boundary answers', async ({ page, api }) => {
  api.options.scenario = 'role-pages';
  await openAssessment(page);
  await expect(page.getByRole('button', { name: 'Page 2', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Page 3', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Long reviewer criteria', exact: true })).toHaveCount(0);
  await enterText(page, 'Learner response 10', 'Before the boundary');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Learner response 10', exact: true })).toHaveCount(0);
  await enterText(page, 'Learner response 11', 'After the boundary');
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
  await expect.poll(() => api.answers[111]).toBe('After the boundary');
  await page.getByRole('button', { name: 'Prev', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Learner response 10', exact: true })).toHaveValue('Before the boundary');
  expect(api.reviewAnswers).toEqual({});
});

test('appends published feedback across page boundaries with guidance on each feedback page', async ({ page, api }) => {
  api.options.scenario = 'role-pages'; api.options.status = 'published'; api.reviewDone = true;
  api.answers = { 110: 'Tenth learner response', 111: 'Last learner response' };
  api.reviewAnswers = { 201: { answer: 'First published criterion' }, 212: { answer: 'Last published criterion' } };
  await openAssessment(page);
  await expect(page.getByRole('button', { name: 'Page 4', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Reviewer Feedback', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('#q-111')).toContainText('Last learner response');
  await expect(page.getByRole('heading', { name: 'Reviewer Feedback', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('#q-201')).toContainText('First published criterion');
  await expect(page.getByRole('heading', { name: 'Reviewer Feedback', exact: true })).toHaveCount(1);
  await expect(page.locator('#q-210')).toBeVisible();
  await expect(page.locator('#q-211')).toHaveCount(0);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('#q-212')).toContainText('Last published criterion');
  await expect(page.getByRole('heading', { name: 'Reviewer Feedback', exact: true })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
  await expect(page.getByRole('textbox')).toHaveCount(0);
  await page.getByRole('button', { name: 'Prev', exact: true }).click();
  await expect(page.locator('#q-201')).toContainText('First published criterion');
  expect(api.operations.some(operation => operation.fields.includes('saveSubmissionAnswer'))).toBe(false);
});
