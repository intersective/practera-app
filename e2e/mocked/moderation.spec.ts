import { test, expect, names, type MockState } from '../support/mock-api';
import { openAssessment, pngFile } from '../support/advanced-controls';
import { enterText, taskButton, textarea } from '../support/controls';
import { seedModeration, learnerWork, publishedReview, reviewFile } from '../support/moderation-fixtures';
import { memberKeys } from '../support/advanced-fixtures';
import { openActorProgram, openAssignedReview, openReviewList, selectAssignedReview, openNotifications,
  goToPage, enterQuestionText } from '../support/moderation-controls';
import type { Page } from '@playwright/test';

async function fillLearner(page: Page) {
  await enterText(page, 'Learner reflection', 'Learner work ready for expert review');
  await enterText(page, 'Learner notes', 'Learner private working notes');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Analysis', exact: true }).click();
}
function reviewButton(page: Page) {
  return page.getByRole('button', { name: 'submit review', exact: true, includeHidden: true });
}
function expectFeedbackPayload(payload: Record<string, unknown>) {
  const answers = payload.answers as Array<Record<string, any>>;
  expect(payload).toMatchObject({ assessmentId: 501, reviewId: 1001, submissionId: 901 });
  const expected = Object.entries(publishedReview).map(([id, value]) => ({
    questionId: Number(id), answer: Number(id) === 101 ? '' : value.answer, comment: value.comment,
    ...('file' in value ? { file: expect.objectContaining({ name: value.file.name,
      url: value.file.url, type: value.file.type, size: value.file.size }) } : {}),
  }));
  expect(answers).toEqual(expect.arrayContaining(expected));
  expect(answers).toHaveLength(22);
  expect(new Set(answers.map(answer => answer.questionId)).size).toBe(22);
  for (const answer of answers) if (answer.file) expect(answer.file).not.toHaveProperty('__typename');
}
async function uploadReviewFile(page: Page, api: MockState, id: number, video = false) {
  const question = page.locator(`#q-${id}`);
  await expect(question.getByRole('button', { name: /browse files/i })).toBeVisible();
  const file = video ? { name: 'evidence.mp4', mimeType: 'video/mp4', buffer: Buffer.from('Synthetic video evidence') } : pngFile;
  await question.locator('input[type=file]:not([webkitdirectory])').setInputFiles(file);
  await question.getByRole('button', { name: /Upload 1 file/i }).click();
  await expect(question.getByText(file.name, { exact: true })).toBeVisible();
  await expect.poll(() => (api.reviewAnswers[id]?.file as any)?.name).toBe(file.name);
}
async function authorExpert(page: Page, api: MockState) {
  await enterQuestionText(page, 101, 'Expert review feedback', 'Specific feedback on the learner reflection');
  await expect.poll(() => api.reviewAnswers[101]?.comment).toBe('Specific feedback on the learner reflection');
  await goToPage(page, 2);
  await page.locator('#q-301').getByRole('checkbox', { name: 'Collaboration', exact: true }).click();
  await enterQuestionText(page, 301, /review feedback/i, 'Shared capability feedback');
  await expect.poll(() => api.reviewAnswers[301]?.comment).toBe('Shared capability feedback');
  await goToPage(page, 3);
  await enterQuestionText(page, 201, "Reviewer's answer", 'Careful expert recommendation');
  await page.locator('#q-202').getByRole('radio', { name: 'Ready', exact: true }).click();
  await page.locator('#q-203').getByRole('checkbox', { name: 'Actionable', exact: true }).click();
  const slider = page.locator('#q-204').getByRole('slider');
  await slider.press('ArrowRight');
  await slider.press('ArrowLeft');
  await expect(slider).toHaveAttribute('aria-valuenow', '0');
  await expect.poll(() => api.reviewAnswers[204]?.answer).toBe(0);
  await page.locator('#q-205').getByRole('radio', { name: 'E2E Peer A', exact: true }).click();
  await page.locator('#q-206').getByRole('checkbox', { name: 'E2E Peer B', exact: true }).click();
  await uploadReviewFile(page, api, 207);
  await uploadReviewFile(page, api, 208);
  await uploadReviewFile(page, api, 209, true);
  await enterQuestionText(page, 210, "Reviewer's answer", 'Supporting expert rationale');
  await expect.poll(() => api.reviewAnswers[210]?.answer).toBe('Supporting expert rationale');
  await expect(reviewButton(page)).toBeDisabled();
  await goToPage(page, 4);
  await enterQuestionText(page, 211, "Reviewer's answer", 'Final expert recommendation');
  await expect.poll(() => api.reviewAnswers[211]?.answer).toBe('Final expert recommendation');
}
async function reopenLearnerAssessment(page: Page) {
  await page.getByRole('button', { name: 'REVIEW TASKS', exact: true }).click();
  await taskButton(page, names.assessment).click();
}

test('submits moderated learner work once and keeps it pending review after reload', async ({ page, api }) => {
  seedModeration(api, 'draft');
  await openAssessment(page);
  await expect(page.getByRole('button', { name: 'submit answers', exact: true, includeHidden: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Page 3', exact: true })).toHaveCount(0);
  await fillLearner(page);
  const submit = page.getByRole('button', { name: 'submit answers', exact: true });
  await expect(submit).toBeEnabled();
  await submit.dblclick();
  await expect(page.getByLabel('Assessment status', { exact: true })).toHaveText('pending review');
  expect(api.submitCount).toBe(1);
  expect(api.submissions[0]).toMatchObject({ submissionId: 901, assessmentId: 501, contextId: 601,
    answers: expect.arrayContaining([{ questionId: 101, answer: 'Learner work ready for expert review' },
      { questionId: 102, answer: 'Learner private working notes' }, { questionId: 301, answer: [3011] }]) });
  await page.reload();
  await expect(page.getByLabel('Assessment status', { exact: true })).toHaveText('pending review');
  await expect(page.locator('#q-101')).toContainText('Learner work ready for expert review');
  await expect(page.getByRole('textbox', { name: 'Learner reflection', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'submit answers', exact: true })).toHaveCount(0);
});

test('retains moderated learner answers after submission fails and permits retry', async ({ page, api }) => {
  seedModeration(api, 'draft');
  await openAssessment(page);
  await fillLearner(page);
  api.failSubmit = true;
  await page.getByRole('button', { name: 'submit answers', exact: true }).click();
  await expect(page.getByText('Submission failed. Please try again.', { exact: true })).toBeVisible();
  expect(api.moderation!.stage).toBe('draft');
  await expect(page.getByRole('checkbox', { name: 'Analysis', exact: true })).toBeChecked();
  await goToPage(page, 1);
  await expect(textarea(page, 'Learner reflection')).toHaveValue('Learner work ready for expert review');
  await expect(page.getByRole('button', { name: 'submit answers', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'submit answers', exact: true }).click();
  await expect(page.getByLabel('Assessment status', { exact: true })).toHaveText('pending review');
  expect(api.submitCount).toBe(2);
});

test('shows no review or assignment notice before an expert is assigned', async ({ page, api }) => {
  seedModeration(api, 'submitted', 'mentor');
  await openActorProgram(page, api);
  await openNotifications(page);
  await expect(page.getByText('New Submission for Review', { exact: true })).toHaveCount(0);
  await expect(page.getByText('You have no new notifications.', { exact: true })).toBeVisible();
  await page.getByRole('banner', { name: 'notifications', exact: true }).getByRole('button').click();
  await expect(page.getByRole('main', { name: 'Notifications list', exact: true })).not.toBeVisible();
  await expect(page.getByLabel('Reviews', { exact: true }).filter({ visible: true })).toHaveCount(0);
  await expect(page.getByRole('form', { name: 'Assessment form' })).toHaveCount(0);
});

test('opens the correct learner submission from the assigned Pending review', async ({ page, api }) => {
  seedModeration(api, 'assigned', 'mentor');
  await openAssignedReview(page, api);
  await expect(page.getByRole('region', { name: 'Submission information' })).toContainText('E2E Learner');
  await expect(page.locator('#q-101')).toContainText('Learner work ready for expert review');
  await expect(page.locator('#q-101').getByRole('textbox', { name: "Reviewer's answer", exact: true })).toHaveCount(0);
  await expect(page.locator('#q-102').getByRole('textbox')).toHaveCount(0);
  expect(api.operations.filter(op => op.fields.includes('assessment')).at(-1)?.variables)
    .toMatchObject({ reviewer: true, assessmentId: 501, contextId: 601, submissionId: 901 });
});

test('opens the assigned submission through the expert notification', async ({ page, api }) => {
  seedModeration(api, 'assigned', 'mentor');
  await openActorProgram(page, api);
  await openNotifications(page);
  await expect(page.getByText('New Submission for Review', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Review submission', exact: true }).click();
  await expect(page.getByRole('form', { name: 'Assessment form' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Submission information' })).toContainText('E2E Learner');
  await expect(page.locator('#q-101')).toContainText('Learner work ready for expert review');
  expect(api.operations.filter(op => op.fields.includes('assessment')).at(-1)?.variables.submissionId).toBe(901);
});

test('authors every expert question type and restores confirmed drafts across pages and reload', async ({ page, api }) => {
  seedModeration(api, 'assigned', 'mentor');
  await openAssignedReview(page, api);
  await expect(reviewButton(page)).toBeDisabled();
  await authorExpert(page, api);
  await expect(reviewButton(page)).toBeEnabled();
  await goToPage(page, 3);
  await expect(page.locator('#q-201').getByRole('textbox', { name: "Reviewer's answer", exact: true })).toHaveValue('Careful expert recommendation');
  await page.reload();
  if (page.viewportSize()!.width >= 768) await selectAssignedReview(page);
  await goToPage(page, 4);
  await expect(page.locator('#q-211').getByRole('textbox', { name: "Reviewer's answer", exact: true })).toHaveValue('Final expert recommendation');
  await expect(reviewButton(page)).toBeEnabled();
  await goToPage(page, 3);
  await expect(page.locator('#q-204').getByRole('slider')).toHaveAttribute('aria-valuenow', '0');
  await expect(page.locator('#q-207').getByText('evidence.png', { exact: true })).toBeVisible();
  await expect(page.locator('#q-201').getByRole('textbox', { name: /review feedback/i })).toHaveCount(0);
  expect(api.reviewAnswers).toMatchObject({ 201: { answer: 'Careful expert recommendation' }, 202: { answer: 2021 },
    203: { answer: [2032] }, 204: { answer: 0 }, 205: { answer: memberKeys[0] }, 206: { answer: [memberKeys[1]] },
    207: { file: reviewFile }, 208: { file: reviewFile }, 209: { file: { name: 'evidence.mp4', type: 'video/mp4' } } });
  await goToPage(page, 2);
  await expect(page.locator('#q-301').getByRole('checkbox', { name: 'Collaboration', exact: true })).toBeChecked();
  await expect(page.locator('#q-301').getByRole('textbox', { name: /review feedback/i })).toHaveValue('Shared capability feedback');
  await goToPage(page, 1);
  await expect(page.locator('#q-101').getByRole('textbox', { name: 'Expert review feedback', exact: true })).toHaveValue('Specific feedback on the learner reflection');
  expect(api.answers).toEqual(learnerWork);
  expect(api.operations.some(op => op.fields.includes('saveSubmissionAnswer'))).toBe(false);
  expect(api.moderation!.reviewSubmissions).toHaveLength(0);
  await goToPage(page, 4);
  await reviewButton(page).click();
  await expect(page.getByText('Review Submitted.', { exact: true })).toBeVisible();
  expect(api.moderation!.reviewSubmissions).toHaveLength(1);
  expectFeedbackPayload(api.moderation!.reviewSubmissions[0]);
  expect(api.answers).toEqual(learnerWork);
});

test('retains unsaved expert feedback and retries a failed review autosave', async ({ page, api }) => {
  seedModeration(api, 'assigned', 'mentor');
  await openAssignedReview(page, api);
  await goToPage(page, 3);
  api.moderation!.failReviewSave = true;
  await enterQuestionText(page, 201, "Reviewer's answer", 'Unsaved expert recommendation');
  const retry = page.locator('#q-201').getByRole('button', { name: 'Retry save', exact: true });
  await expect(retry).toBeVisible();
  await expect(page.locator('#q-201').getByRole('textbox')).toHaveValue('Unsaved expert recommendation');
  expect(api.reviewAnswers[201]).toBeUndefined();
  api.moderation!.failReviewSave = false;
  await retry.click();
  await expect.poll(() => api.reviewAnswers[201]?.answer).toBe('Unsaved expert recommendation');
  await expect(retry).not.toBeVisible();
});

test('submits expert feedback once and moves the assigned review to Completed', async ({ page, api }) => {
  seedModeration(api, 'assigned', 'mentor'); api.reviewAnswers = structuredClone(publishedReview);
  await openAssignedReview(page, api);
  await goToPage(page, 4);
  await expect(reviewButton(page)).toBeEnabled();
  await reviewButton(page).dblclick();
  await expect(page.getByText('Review Submitted.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'submit review', exact: true })).toHaveCount(0);
  expect(api.moderation!.reviewSubmissions).toHaveLength(1);
  expectFeedbackPayload(api.moderation!.reviewSubmissions[0]);
  if (page.viewportSize()!.width < 768) {
    await page.locator('app-assessment-mobile ion-header ion-buttons[slot=start]').getByRole('button').click();
  }
  await expect(page.getByText('You have no pending review yet!', { exact: true })).toBeVisible();
  await page.locator('ion-segment-button[value=completed]').click();
  await selectAssignedReview(page);
  await goToPage(page, 3);
  await expect(page.locator('#q-201')).toContainText('Careful expert recommendation');
  await expect(page.locator('#q-201').getByRole('textbox')).toHaveCount(0);
  await openNotifications(page);
  await expect(page.getByText('New Submission for Review', { exact: true })).toHaveCount(0);
  expect(api.answers).toEqual(learnerWork);
});

test('keeps a successfully submitted review read-only when notification refresh fails', async ({ page, api }) => {
  seedModeration(api, 'assigned', 'mentor'); api.reviewAnswers = structuredClone(publishedReview);
  await openAssignedReview(page, api);
  await goToPage(page, 4);
  api.moderation!.failTodoRefresh = true;
  await reviewButton(page).click();
  await expect(page.getByText('Review Submitted.', { exact: true })).toBeVisible();
  await expect(page.getByText('Submission failed. Please try again.', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'submit review', exact: true })).toHaveCount(0);
  if (page.viewportSize()!.width < 768) {
    await expect(page.locator('#q-211').getByRole('textbox')).toHaveCount(0);
  } else {
    await expect(page.getByText('You have no pending review yet!', { exact: true })).toBeVisible();
    await page.locator('ion-segment-button[value=completed]').click();
    await selectAssignedReview(page);
    await goToPage(page, 4);
    await expect(page.locator('#q-211').getByRole('textbox')).toHaveCount(0);
  }
  await page.reload();
  if (page.viewportSize()!.width >= 768) {
    await page.locator('ion-segment-button[value=completed]').click();
    await selectAssignedReview(page);
  }
  await goToPage(page, 4);
  await expect(page.locator('#q-211')).toContainText('Final expert recommendation');
  await expect(page.getByRole('button', { name: 'submit review', exact: true })).toHaveCount(0);
  expect(api.moderation!.reviewSubmissions).toHaveLength(1);
});

test('keeps expert answers and comments after review submission fails and permits retry', async ({ page, api }) => {
  seedModeration(api, 'assigned', 'mentor'); api.reviewAnswers = structuredClone(publishedReview);
  await openAssignedReview(page, api);
  await goToPage(page, 4);
  api.moderation!.failReviewSave = true;
  await enterQuestionText(page, 211, "Reviewer's answer", 'Keep this edited final recommendation');
  await expect(page.locator('#q-211').getByRole('button', { name: 'Retry save', exact: true })).toBeVisible();
  api.moderation!.failReviewSubmit = true;
  await expect(reviewButton(page)).toBeEnabled();
  api.moderation!.failReviewSave = false;
  await reviewButton(page).click();
  await expect(page.getByText('Submission failed. Please try again.', { exact: true })).toBeVisible();
  expect(api.moderation!.stage).toBe('assigned');
  await expect(page.locator('#q-211').getByRole('textbox')).toHaveValue('Keep this edited final recommendation');
  await expect(reviewButton(page)).toBeEnabled();
  await reviewButton(page).click();
  await expect(page.getByText('Review Submitted.', { exact: true })).toBeVisible();
  expect(api.moderation!.reviewSubmissions).toHaveLength(2);
  expect(api.moderation!.reviewSubmissions[1].answers).toEqual(expect.arrayContaining([
    { questionId: 211, answer: 'Keep this edited final recommendation', comment: '' },
    { questionId: 101, answer: '', comment: 'Specific feedback on the learner reflection' },
  ]));
});

test('keeps assigned but unpublished feedback private from the learner', async ({ page, api }) => {
  seedModeration(api, 'assigned'); api.reviewAnswers = structuredClone(publishedReview);
  await openAssessment(page);
  await expect(page.getByLabel('Assessment status', { exact: true })).toHaveText('pending review');
  await expect(page.getByText('Specific feedback on the learner reflection', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Expert criteria', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Page 3', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'mark feedback as reviewed', exact: true })).toHaveCount(0);
  await openNotifications(page);
  await expect(page.getByText('New Feedback', { exact: true })).toHaveCount(0);
});

test('opens published feedback from the learner notification with correct answer ownership on every page', async ({ page, api }) => {
  seedModeration(api, 'published');
  await openActorProgram(page, api);
  await openNotifications(page);
  await expect(page.getByText('New Feedback', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Check feedback', exact: true }).click();
  await expect(page.getByLabel('Assessment status', { exact: true })).toHaveText('feedback available');
  await expect(page.getByRole('region', { name: 'Reviewer information' })).toContainText('E2E Reviewer');
  await expect(page.locator('#q-101')).toContainText('Learner work ready for expert review');
  await expect(page.locator('#q-101').locator('textarea')).toHaveValue('Specific feedback on the learner reflection');
  await goToPage(page, 2);
  const sharedChoices = page.locator('#q-301 ion-item');
  await expect(sharedChoices.filter({ has: page.getByText('Analysis', { exact: true }) })).toContainText('Your Answer');
  await expect(sharedChoices.filter({ has: page.getByText('Analysis', { exact: true }) })).not.toContainText("Reviewer's Answer");
  await expect(sharedChoices.filter({ has: page.getByText('Collaboration', { exact: true }) })).toContainText("Reviewer's Answer");
  await expect(sharedChoices.filter({ has: page.getByText('Collaboration', { exact: true }) })).not.toContainText('Your Answer');
  await goToPage(page, 3);
  await expect(page.getByRole('heading', { name: 'Reviewer Feedback', exact: true })).toHaveCount(1);
  await expect(page.locator('#q-201')).toContainText('Careful expert recommendation');
  await expect(page.locator('#q-201')).not.toContainText('Your Answer');
  await expect(page.locator('#q-202')).toContainText('Ready');
  await expect(page.locator('#q-203')).toContainText('Selected by reviewer');
  await expect(page.locator('#q-204').getByRole('slider')).toHaveAttribute('aria-valuenow', '0');
  await expect(page.locator('#q-204').getByRole('slider')).toBeDisabled();
  await expect(page.locator('#q-205')).toContainText('E2E Peer A');
  await expect(page.locator('#q-206')).toContainText('E2E Peer B');
  await expect(page.locator('#q-207').getByText('evidence.png', { exact: true })).toBeVisible();
  await expect(page.locator('#q-208').getByText('evidence.png', { exact: true })).toBeVisible();
  await expect(page.locator('#q-209').getByText('evidence.mp4', { exact: true })).toBeVisible();
  await expect(page.locator('#q-210')).toContainText('Supporting expert rationale');
  await goToPage(page, 4);
  await expect(page.getByRole('heading', { name: 'Reviewer Feedback', exact: true })).toHaveCount(1);
  await expect(page.locator('#q-211')).toContainText('Final expert recommendation');
  expect(api.operations.some(op => op.fields.includes('saveSubmissionAnswer') || op.fields.includes('saveReviewAnswer'))).toBe(false);
});

test('acknowledges published feedback once, removes its notice, and preserves the feedback after reload', async ({ page, api }) => {
  seedModeration(api, 'published');
  await openAssessment(page);
  await page.getByRole('button', { name: 'mark feedback as reviewed', exact: true }).dblclick();
  await expect.poll(() => api.moderation!.acknowledgments.length).toBe(1);
  expect(api.moderation!.acknowledgments[0]).toEqual({ id: null, identifier: 'AssessmentSubmission-901', isDone: true });
  await expect(page.getByRole('button', { name: 'mark feedback as reviewed', exact: true })).toHaveCount(0);
  // The unfinished reading topic triggers the existing activity-completion dialog.
  await reopenLearnerAssessment(page);
  await expect(page.getByRole('button', { name: 'continue', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'continue', exact: true })).toBeVisible();
  await expect(page.locator('#q-101').locator('textarea')).toHaveValue('Specific feedback on the learner reflection');
  await openNotifications(page);
  await expect(page.getByText('New Feedback', { exact: true })).toHaveCount(0);
  expect(api.moderation!.acknowledgments).toHaveLength(1);
});

test('keeps feedback unread after acknowledgment fails and permits retry', async ({ page, api }) => {
  seedModeration(api, 'published');
  await openAssessment(page);
  api.moderation!.failAcknowledgment = true;
  const read = page.getByRole('button', { name: 'mark feedback as reviewed', exact: true });
  await read.click();
  await expect.poll(() => api.moderation!.acknowledgments.length).toBe(1);
  await expect(read).toBeEnabled();
  await expect(page.locator('#q-101').locator('textarea')).toHaveValue('Specific feedback on the learner reflection');
  expect(api.moderation!.stage).toBe('published');
  await openNotifications(page);
  await expect(page.getByText('New Feedback', { exact: true })).toBeVisible();
  await page.getByRole('banner', { name: 'notifications', exact: true }).getByRole('button').click();
  await expect(page.getByRole('main', { name: 'Notifications list', exact: true })).not.toBeVisible();
  await read.click();
  await expect.poll(() => api.moderation!.stage).toBe('read');
  await expect(read).toHaveCount(0);
  expect(api.moderation!.acknowledgments).toHaveLength(2);
});
