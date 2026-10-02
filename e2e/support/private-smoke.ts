import type { Page } from '@playwright/test';

// Keep original locator errors, matcher snapshots and page content out of live artifacts.
// The launcher/config also disable screenshot, video, trace and automatic ARIA capture.
export async function privateSmoke(page: Page, run: (stage: (name: string) => void) => Promise<void>) {
  let stage = 'preflight';
  try {
    await run(name => stage = name);
  } catch {
    throw new Error(`Sandbox smoke failed during ${stage}. Check the fresh learner token, dedicated test data and sandbox availability.`);
  } finally {
    await page.close().catch(() => undefined);
  }
}
