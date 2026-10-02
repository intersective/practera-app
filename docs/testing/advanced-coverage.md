# Advanced learner regression coverage

Requested 2026-10-02 on chaw-login-refactor-e2e. This extends the existing local, mocked browser harness. Sandbox execution remains pending by request. No new dependencies or live uploads are needed.

## Coverage matrix

| Area | States and assertions |
| --- | --- |
| Uppy popup | Real Dashboard DOM has a visible browse control and nonzero dimensions; image restrictions reject documents; a selected image can be removed; reopening renders again; mocked TUS completion updates the profile using returned metadata. |
| Assessment question controls | Text, single/multiple choice, slider, file/video, single/multiple team-member selectors; required validation, correct saved payloads, saved file display, keyboard interaction, and read-only rendering. |
| Audience and role UI | Submitter-only, reviewer-only, shared groups; learner draft/pending/published views; pending/completed reviewer views; reviewer navigation and participant Events visibility; locked submissions remove authoring controls and disable continuation. These prove frontend UI rules, not server authorization. |
| Pagination | Ordinary groups split at the question limit; reviewer-only groups affect pages only when visible; page indicators and forward/back state; Team360 keeps group order, caps peer sections by distinct members, retains non-peer sections, and requires a completed first member section. |
| Locked content | Milestone/activity indicators; complete/submit links reach the correct task; unsupported, mixed and incomplete metadata use full fallback without partial links; locked targets remain inaccessible. Backend lock evaluation remains authoritative. |
| Post-assessment feedback | Actual successful submission followed by Pulse Check query; available response opens one modal; empty/incomplete response does not; multi-page required feedback retains selections and submits correct target identifiers. Published assessment review is covered separately. |

## Implementation and verification

Extend isolated scenario fixtures at the API boundary. Keep real Angular services, guards, components, Ionic overlays and Uppy plugins. Reject unexpected requests and check mutation identifiers. Use accessible selectors and observable completion, with narrow existing element IDs when needed.

WebKit's network protocol omits Blob request bodies, matching the upstream [Playwright issue](https://github.com/microsoft/playwright/issues/6479). Mocked WebKit contexts observe the original Blob passed to XMLHttpRequest.send and delegate to the native method with unchanged arguments. The TUS fixture reads those bytes when postDataBuffer is null; it still rejects missing/incorrect byte lengths, offsets, credentials and sources. Chromium uses its network request body directly. This observer is absent from sandbox tests and product code.

Run each new scenario on desktop Chromium first while diagnosing failures, then all three existing profiles. A discovered application defect needs a failing regression before a minimal fix. Run the relevant unit suites, full baseline, development build and browser typecheck after source changes. Preserve unrelated blockers. Prove key tests detect a deliberately broken response, then restore it. Record final counts and limitations in verification.md.

Execution is authorized by the user's request to work on these four areas. No separate design approval, worktree, publication or CI setup is part of this extension.

## Defects reproduced during implementation

- Async profile upload completion changed the model without notifying Angular, leaving the displayed avatar unchanged. Settings now updates pending, success and final states inside NgZone and marks the view for checking.
- Partial feedback options omitted skipChecking, so missing metadata could still open a modal. Only explicit skipChecking=true now bypasses that check.
- GraphQL feedback metadata used camelCase while the existing modal input expected snake_case, losing context/team targets on submission. The service now maps metadata at the modal boundary.
- Inline assessment uploads retained an unimplemented legacy uppy-dashboard element. A native Dashboard plugin now mounts into the conditional host, unmounts when the file is saved, and remounts after removal. Each question has its own Dashboard options.
- Legacy video questions passed videoOnly without a fileType, so the uploader accepted images. Effective file type now honors videoOnly for restrictions, notes and saved-file display.
- Text review comments had no autosave listener when the learner answer was read-only. Both editable answer and comment inputs now use the existing debounce/save flow and cancel on destruction.
- Mobile lock-guidance links used nonexistent /v3 task routes. They now follow the registered top-level topic and assessment paths with correct parameter order.
- Shared multiple-choice learner answers displayed a reviewer-facing ownership label. The learner view now displays "Your Answer" before the answer content. Read-only ownership chips also honor the feedback context, and selection checks use the existing array-normalization helpers.
- Single-choice answers had the same ownership-label problem and leaked ownership chips into the legacy reviewer-feedback context. Labels now follow the viewer and appear before the answer, with both feedback flags honored.

Relevant stale unit fixtures were repaired without weakening their behavior assertions: pagination setup includes physical pages, feature-toggle tests explicitly cover both values and restore the environment, the mobile scroll mock overrides the read-only Ionic method, and the first-peer fixture uses a real leading non-peer section. Direct method/property changes notify Angular before checking rendered state. Team-selector order checks use DOM order across Ionic's wrappers rather than assuming direct children. Their existing ownership labels required no product change.

Focused unit and browser tests reproduced these symptoms before the fixes. Final local validation passed 618 focused unit cases and five complete three-profile browser runs (525 checks, no retries/skips/flaky results), plus the development build and both TypeScript checks. The full unit baseline still has 16 existing failures, lint has its existing dependency blocker, and sandbox smoke remains pending. See [verification results](verification.md) for exact evidence and limitations.
