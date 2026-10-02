import { test, expect } from '../support/mock-api';
import { openAssessment, pngFile } from '../support/advanced-controls';
import { enterText, textarea } from '../support/controls';
import { memberKeys, uploadMetadata } from '../support/advanced-fixtures';

test('saves all interactive question types and requires an uploaded file before submission', async ({ page, api }) => {
  api.options.scenario = 'types';
  await openAssessment(page);
  const submit = page.getByRole('button', { name: 'submit answers', exact: true, includeHidden: true });
  await expect(submit).toBeDisabled();
  await enterText(page, 'Learning notes', 'Test the complete interaction.');
  await page.getByRole('radio', { name: 'Investigate', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Collaboration', exact: true }).click();
  const slider = page.locator('#q-104').getByRole('slider');
  for (let i = 0; i < 4; i++) await slider.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuenow', '5');
  await page.locator('#q-105').getByRole('radio', { name: 'E2E Peer A', exact: true }).click();
  await page.locator('#q-106').getByRole('checkbox', { name: 'E2E Peer B', exact: true }).click();
  await expect.poll(() => api.answers[106]).toEqual([memberKeys[1]]);
  await expect(submit).toBeDisabled();
  const file = page.locator('#q-107');
  await expect(file.getByRole('button', { name: /browse files/i })).toBeVisible();
  await file.locator('input[type=file]:not([webkitdirectory])').setInputFiles(pngFile);
  await file.getByRole('button', { name: /Upload 1 file/i }).click();
  await expect.poll(() => api.files[107]).toEqual({ name: 'evidence.png', type: 'image/png', size: pngFile.buffer.length,
    extension: 'png', bucket: 'e2e-bucket', path: 'e2e/evidence.png', url: uploadMetadata.cdnUrl });
  await expect(submit).toBeEnabled();
  expect(api.answers).toMatchObject({ 101: 'Test the complete interaction.', 102: 1021, 103: [1032], 104: 5, 105: memberKeys[0], 106: [memberKeys[1]] });
  await page.reload();
  await expect(textarea(page, 'Learning notes')).toHaveValue('Test the complete interaction.');
  await expect(page.locator('#q-107').getByText('evidence.png', { exact: true })).toBeVisible();
  await expect(page.locator('#q-107').locator('.uppy-Dashboard')).toHaveCount(0);
});

test('enforces image and video restrictions in inline assessment dashboards', async ({ page, api }) => {
  api.options.scenario = 'types';
  await openAssessment(page);
  const image = page.locator('#q-108');
  await expect(image.getByRole('button', { name: /browse files/i })).toBeVisible();
  await image.locator('input[type=file]:not([webkitdirectory])').setInputFiles({ name: 'document.txt', mimeType: 'text/plain', buffer: Buffer.from('Synthetic document') });
  await expect(image.locator(".uppy-Informer").getByText(/You can only upload/).filter({ visible: true })).not.toHaveCount(0);
  const video = page.locator('#q-109');
  await expect(video.getByRole('button', { name: /browse files/i })).toBeVisible();
  await video.locator('input[type=file]:not([webkitdirectory])').setInputFiles(pngFile);
  await expect(video.locator(".uppy-Informer").getByText(/You can only upload/).filter({ visible: true })).not.toHaveCount(0);
  expect(api.uploads).toHaveLength(0);
});

test('renders completed question answers read-only with learner ownership and no upload controls', async ({ page, api }) => {
  api.options.scenario = 'types'; api.options.status = 'done'; api.submitted = true;
  api.answers = { 101: 'Submitted learning', 102: 1021, 103: [1032], 104: 5, 105: memberKeys[0], 106: [memberKeys[1]] };
  api.files[107] = { name: 'evidence.png', type: 'image/png', url: uploadMetadata.cdnUrl };
  await openAssessment(page);
  await expect(page.locator('#q-101')).toContainText('Submitted learning');
  await expect(page.locator('#q-101')).toContainText('Your Answer');
  await expect(page.locator('#q-102')).toContainText('Investigate');
  await expect(page.locator('#q-103')).toContainText('Collaboration');
  await expect(page.locator('#q-105')).toContainText('E2E Peer A');
  await expect(page.locator('#q-106')).toContainText('E2E Peer B');
  for (const id of [102, 103, 105, 106]) {
    await expect(page.locator(`#q-${id}`)).toContainText('Your Answer');
    await expect(page.locator(`#q-${id}`)).not.toContainText("Learner's Answer");
  }
  await expect(page.locator('#q-104').getByRole('slider')).toBeDisabled();
  await expect(page.locator('#q-107').getByText('evidence.png', { exact: true })).toBeVisible();
  await expect(page.locator('.uppy-Dashboard')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'submit answers', exact: true })).toHaveCount(0);
  expect(api.operations.some(operation => operation.fields.includes('saveSubmissionAnswer'))).toBe(false);
});
