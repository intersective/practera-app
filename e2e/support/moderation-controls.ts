import type { Page } from '@playwright/test';
import { expect, names, openProgram, type MockState } from './mock-api';
import { actors } from './moderation-fixtures';

export async function openActorProgram(page: Page, api: MockState) {
  await openProgram(page, actors[api.options.role].token);
}
export async function openReviewList(page: Page, completed = false) {
  if (page.viewportSize()!.width >= 768) {
    await page.getByRole('navigation', { name: 'menu', exact: true }).getByRole('link', { name: /^Reviews(?:, \d+ unread)?$/ }).click();
  } else await page.getByRole('tab', { name: /^Reviews(?:, \d+ unread)?$/ }).click();
  if (completed) {
    await page.locator('ion-segment-button[value=completed]').click();
    await expect(page.getByRole('tab', { name: 'Completed', exact: true })).toHaveAttribute('aria-selected', 'true');
  }
}
export async function selectAssignedReview(page: Page) {
  await page.locator('app-review-list').getByRole('button').filter({ has: page.getByRole('heading', { name: names.assessment, exact: true }) }).click();
  await expect(page.getByRole('form', { name: 'Assessment form' })).toBeVisible();
}
export async function openAssignedReview(page: Page, api: MockState) {
  await openActorProgram(page, api);
  await openReviewList(page);
  await selectAssignedReview(page);
}
export async function openNotifications(page: Page) {
  // During mobile navigation, the outgoing page header can remain visible until Ionic's transition ends.
  const scope = page.viewportSize()!.width < 768 && new URL(page.url()).pathname.startsWith('/assessment')
    ? page.locator('app-assessment-mobile > ion-header') : page;
  await scope.getByRole('button', { name: /^Notifications(?:, \d+ unread)?$/ }).filter({ visible: true }).first().click();
  await expect(page.getByRole('main', { name: 'Notifications list', exact: true })).toBeVisible();
}
export async function goToPage(page: Page, number: number) {
  await page.getByRole('button', { name: `Page ${number}`, exact: true }).click();
}
export async function enterQuestionText(page: Page, id: number, name: string | RegExp, value: string) {
  const field = page.locator(`#q-${id}`).getByRole('textbox', { name, exact: typeof name === 'string' })
    .and(page.locator('textarea:not(.cloned-input)'));
  await field.fill('');
  await field.pressSequentially(value);
}
