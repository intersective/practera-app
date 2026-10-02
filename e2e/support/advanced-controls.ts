import { expect, names, openProgram } from './mock-api';
import type { Page } from '@playwright/test';
import { taskButton } from './controls';

export async function openAssessment(page: Page) {
  await openProgram(page);
  await page.getByRole('button', { name: names.activity, exact: true }).click();
  await taskButton(page, names.assessment).click();
  await expect(page.getByRole('form', { name: 'Assessment form' })).toBeVisible();
}
export const pngFile = {
  name: 'evidence.png', mimeType: 'image/png',
  buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j7l8AAAAASUVORK5CYII=', 'base64'),
};
export async function openSettings(page: Page) {
  await openProgram(page);
  await page.getByRole('banner', { name: 'home', exact: true }).getByRole('button', { name: 'Go to settings', exact: true }).click();
  await expect(page.getByRole('main', { name: 'Settings', exact: true })).toBeVisible();
}
