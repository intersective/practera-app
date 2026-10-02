import { test, expect } from '../support/mock-api';
import { openSettings, pngFile } from '../support/advanced-controls';
import { uploadMetadata } from '../support/advanced-fixtures';

test('renders the real Uppy popup, validates file type, and renders again after reopening', async ({ page, api }) => {
  await openSettings(page);
  await page.getByRole('button', { name: 'Upload', exact: true }).click();
  const popup = page.locator('ion-modal.uppy-uploader-modal');
  await expect(popup.getByRole('button', { name: /browse files/i })).toBeVisible();
  const box = await popup.locator('.uppy-Dashboard-inner').boundingBox();
  expect(box?.width).toBeGreaterThan(200);
  expect(box?.height).toBeGreaterThan(200);
  await popup.locator('input[type=file]:not([webkitdirectory])').setInputFiles({ name: 'rejected.txt', mimeType: 'text/plain', buffer: Buffer.from('Synthetic document') });
  await expect(popup.locator(".uppy-Informer").getByText(/You can only upload/).filter({ visible: true })).not.toHaveCount(0);
  await popup.locator('input[type=file]:not([webkitdirectory])').setInputFiles(pngFile);
  await expect(popup.getByText('evidence.png', { exact: true })).toBeVisible();
  await popup.getByRole('button', { name: /Remove file/ }).click();
  await expect(popup.getByText('evidence.png', { exact: true })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(popup).toHaveCount(0);
  await page.getByRole('button', { name: 'Upload', exact: true }).click();
  await expect(popup.getByRole('button', { name: /browse files/i })).toBeVisible();
  expect(api.uploads).toHaveLength(0);
});

test('completes a mocked TUS profile upload and uses returned direct-file metadata', async ({ page, api }) => {
  await openSettings(page);
  await page.getByRole('button', { name: 'Upload', exact: true }).click();
  const popup = page.locator('ion-modal.uppy-uploader-modal');
  await expect(popup.getByRole('button', { name: /browse files/i })).toBeVisible();
  await popup.locator('input[type=file]:not([webkitdirectory])').setInputFiles(pngFile);
  await popup.getByRole('button', { name: /Upload 1 file/i }).click();
  await expect(page.getByRole('alertdialog')).toContainText('Profile picture successfully updated!');
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(popup).toHaveCount(0);
  await expect(page.getByRole('img', { name: 'user profile', exact: true })).toHaveAttribute('src', uploadMetadata.directUrl);
  expect(api.profileAvatar).toEqual({ name: 'evidence.png', type: 'image/png', size: pngFile.buffer.length, extension: 'png',
    bucket: 'e2e-bucket', path: 'e2e/evidence.png', url: uploadMetadata.directUrl });
});
