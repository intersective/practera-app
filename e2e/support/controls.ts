import type { Page } from '@playwright/test';

// Task status and deadlines may add text to the button's accessible name.
export function taskButton(page: Page, title: string) {
  return page.getByRole('button').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
}

export function textarea(page: Page, name: string) {
  return page.getByRole('textbox', { name, exact: true }).and(page.locator('textarea:not(.cloned-input)'));
}
export async function enterText(page: Page, name: string, value: string) {
  const input = textarea(page, name);
  await input.fill('');
  await input.pressSequentially(value);
}
