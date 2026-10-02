import type { Page } from '@playwright/test';

// Task status and deadlines may add text to the button's accessible name.
export function taskButton(page: Page, title: string) {
  return page.getByRole('button').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
}
