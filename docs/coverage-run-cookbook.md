# Coverage Run Cookbook (v3)

> Fast, repeatable coverage workflow for this repo.

## Current baseline

Full-suite baseline recorded on 2026-06-22 with `npm test`:

| Metric | Covered | Percentage |
|---|---:|---:|
| Statements | 5,676 / 8,286 | 68.50% |
| Branches | 2,712 / 4,632 | 58.54% |
| Functions | 1,288 / 1,931 | 66.70% |
| Lines | 5,470 / 8,010 | 68.28% |

The suite contains 1,482 specs: 1,466 passing and 16 skipped. When adding
coverage, prioritise business logic with a large number of uncovered executable
statements and branches. Assert state transitions, persistence, emitted values,
and error paths rather than adding creation-only specs.

The core `AssessmentComponent` baseline is 95.31% statements, 89.13%
branches, 97.32% functions, and 95.18% lines.

### Assessment question components

A focused run recorded on 2026-06-22 covers the seven question component
suites rendered by `AssessmentComponent`. These percentages come from the
focused run only and must not be compared with the full-suite totals above,
which can include incidental coverage from other specs.

| Component | Statements | Branches | Functions | Lines |
|---|---:|---:|---:|---:|
| Text | 94.02% | 89.79% | 94.73% | 93.75% |
| Slider | 83.16% | 79.16% | 90.00% | 82.82% |
| One-of | 80.00% | 73.13% | 80.00% | 80.88% |
| Multiple | 83.16% | 80.85% | 91.30% | 82.47% |
| File upload (file and video) | 98.13% | 87.69% | 100.00% | 98.11% |
| Team-member selector | 96.07% | 93.87% | 93.33% | 96.00% |
| Multi-team-member selector | 94.89% | 94.31% | 95.23% | 94.84% |

The seven focused suites contain 277 passing specs. Running them with the
parent assessment suite results in 500 passing and 6 intentionally skipped
specs.

## Quick Rules

- Use targeted coverage runs first; use full-suite only after targeted changes pass.
- Use workspace-relative include paths starting with `projects/v3/src/...`.
- Save logs under `./output` for every run.
- Prefer `ChromeHeadless` for CI-like behavior.

## 1) Targeted Coverage Run (Single Spec)

```bash
npm test -- --code-coverage --browsers=ChromeHeadless --include='projects/v3/src/app/pages/tabs/tabs.page.spec.ts' > ./output/coverage-targeted-tabs.log 2>&1
```

## 2) Targeted Coverage Run (Multiple Specs)

```bash
npm test -- --code-coverage --browsers=ChromeHeadless \
  --include='projects/v3/src/app/pages/activity-mobile/activity-mobile.page.spec.ts' \
  --include='projects/v3/src/app/pages/topic-mobile/topic-mobile.page.spec.ts' \
  --include='projects/v3/src/app/pages/tabs/tabs.page.spec.ts' \
  --include='projects/v3/src/app/pages/chat/chat-list/chat-list.component.spec.ts' \
  --include='projects/v3/src/app/pages/chat/chat-preview/chat-preview.component.spec.ts' \
  > ./output/coverage-targeted-mobile-chat-tabs-topic.log 2>&1
```

## 3) Full-Suite Coverage Run

```bash
npm run test -- --code-coverage --browsers=ChromeHeadless > ./output/full-suite-coverage.log 2>&1
```

## 4) Open HTML Coverage Report

```bash
open coverage/v3/index.html
```

Open folder-level reports directly when needed, for example:

- `coverage/v3/src/app/pages/activity-mobile/index.html`
- `coverage/v3/src/app/pages/topic-mobile/index.html`
- `coverage/v3/src/app/pages/tabs/index.html`
- `coverage/v3/src/app/pages/chat/chat-list/index.html`

## 5) Tail Logs Quickly

```bash
wc -l ./output/full-suite-coverage.log && tail -n 60 ./output/full-suite-coverage.log
```

## 6) What Is Noise vs Blocker?

Usually non-blocking during this repo’s test runs:

- `NG0303/NG0304` unknown element/property warnings
- Ionic runtime warnings in templates
- SVG/asset `404` warnings in Karma output

Treat as blockers:

- TypeScript compile errors
- Karma `ERROR` status
- `Some of your tests did a full page reload!`

## 7) Prevent Common Flaky Failures

- Do not assign `window.location.href`/`location` directly in unit tests.
- Spy/mock navigation helpers or Angular Router instead.
- If a component destroys external instances in `ngOnDestroy`, initialize mocks with `destroy` spies in tests.
- Add explicit branch tests for keyboard guards (`Enter`, `Space`, unsupported keys).

## 8) Suggested Workflow

1. Run targeted specs for changed files.
2. Fix compile/runtime test failures.
3. Verify folder-level coverage HTML for target modules.
4. Run one full-suite coverage pass.
5. Save/hand over logs from `./output`.
