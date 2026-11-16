# CORE-8562 Navigation Follow-up Implementation Plan

> **For agentic workers:** Use `superpowers:executing-plans` to implement these tasks in this checkout. Steps use checkboxes for tracking.

**Goal:** Resolve the four remaining navigation defects reproduced in desktop Safari.

**Architecture:** Keep route-based static titles and component-owned dynamic review titles. Overlay components preserve the current route title; navigation out of an overlay waits for its dismissal. Successful router navigation restores the active desktop review title.

**Tech Stack:** Angular 21, Ionic 9 NgModules, RxJS, Karma/Jasmine, Safari.

**Spec:** Safari findings from CORE-8562: Notifications drawer leaves its title behind; cached desktop Reviews retains Events title; Badges opens behind Settings; direct desktop Notifications Back does nothing.

## Global Constraints

- Preserve selected-review names and HTML-entity decoding through UtilsService.
- Use Angular control-flow syntax and the existing Ionic NgModule approach.
- Preserve `prebundle.exclude`; do not add dependencies or store credentials.
- Use NgZone and markForCheck in subscription callbacks; assign overlay spies directly in tests.
- Keep the user's local-development authorization in AGENTS.md intact.

## Review Focus

- Notifications opened on Home, Events, or dynamic content must preserve the page title.
- Cached review return must restore a selected name or the empty-list title.
- Hidden or destroyed review subscriptions must not overwrite another page's title.
- Keyboard activation must follow the same dismiss-before-navigate path as clicks.
- Full-page Notifications must support desktop/mobile history and direct-entry fallback.

## Task 1: Notifications title and Back behavior

Files: `projects/v3/src/app/pages/notifications/notifications.page.ts`, `.html`, `.spec.ts`; `projects/v3/src/app/personalised-header/personalised-header.component.ts`, `.spec.ts`.

- [x] Add failing tests for modal title preservation and full-page/modal Back on both screen modes, including direct-entry fallback and ignored keyboard keys.
- [x] Run the Notifications tests and confirm the new cases fail for the observed defects.
- [x] Guard modal title changes. Choose Back behavior by `mode`; record the originating route in mobile header navigation state, return to that route explicitly, and fall back to Home for direct entry. Label the Back/Close controls.
- [x] Rerun the Notifications tests.

## Task 2: Settings to Badges

Files: `projects/v3/src/app/pages/settings/settings.page.ts`, `.spec.ts`.

- [x] Add a failing test proving navigation waits for drawer dismissal, plus full-page and keyboard cases.
- [x] Confirm the failure, then make dismissal awaitable and await it only in modal mode before navigating.
- [x] Rerun Settings tests; include rejected dismissal without navigation.

## Task 3: Cached desktop review titles

Files: `projects/v3/src/app/pages/review-desktop/review-desktop.page.ts`, `.spec.ts`.

- [x] Add failing tests for empty/selected review title restoration, query/matrix/detail routes, hidden background emissions, and destruction.
- [x] Confirm failures. Subscribe to successful router navigation, restore the current review title only on the review route, and clean up subscriptions on destruction.
- [x] Preserve selected review-name titles, including the existing unnamed-review fallback; clear stale selection when no review exists.
- [x] Rerun review and route-title regressions.

## Task 4: Verification and PR

- [x] Run the affected suites and full test command. Report baseline fixture errors by file; do not hide them.
- [x] Check development-server compilation and repeat Safari navigation for all four findings, cached returns, original Messages flow, and logout/login if required.
- [x] Review the diff and tests independently before committing and updating PR #2811.
- [x] Investigate CI: the tracked/gitignored-file check passes; Gitleaks reports 75 historical findings. Document this existing blocker without weakening the scan or rewriting history.

## Execution ruling

Safari showed that the previous-Angular-navigation/history-length heuristic could leave the app for Start Page after a cached direct-entry return. Record the header's return URL in the Notifications history entry and navigate explicitly to an allowed app destination (or Home), replacing the Notifications entry. This preserves the origin through cached visits and browser Back/Forward without relying on the browser history index.

## Verification results

- Red/green: reproduced Notifications/header failures (16 failing new expectations), then passed all 117 tests across Notifications, Settings, Reviews, header, and route-title suites using a temporary scoped TypeScript config. Settings and review regressions also failed before their fixes.
- Full `npm test`: blocked at compilation by existing fixtures: missing `directUrl` in file-display (lines 57, 84), file-upload (96), auth.service (120, 159, 220, 259), and incomplete ProgramObj in experiences (126). These unrelated files were not changed.
- Local Angular server rebuilt and sent page reloads successfully.
- Safari: Notifications drawers preserve Home/Events titles; Reviews returns from Events with its own title; Settings dismisses before Badges appears; routed Badges Back reaches Settings; Due Status and Events titles restore; cached direct-entry Notifications Back returns Home without leaving the app. The selector title appeared while loading, then the account's sole experience was selected automatically.
- Safari limits: account has no Messages link and direct Messages visits did not retain that route; populated review data was unavailable. Unit tests cover Messages/selector route titles, selected review names, and mobile Notifications origin state. Do not treat these as a complete Safari matrix.
- Independent read-only review found no actionable correctness issues, including the explicit-return Back redesign.
- CI remains blocked by 75 historical Gitleaks findings; the tracked-but-ignored-file check itself passed. No scan exceptions were added.
