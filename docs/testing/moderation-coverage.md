# Moderated assessment review coverage

Approved 2026-10-02 for chaw-login-refactor-e2e. Extends the existing local mocked harness with 14 independently runnable scenarios. Local validation is complete; results are recorded below and in verification.md. Sandbox execution remains pending at the user's request.

Extend the existing mocked harness with independently runnable learner submission, expert assignment, expert authoring/submission, and learner feedback acknowledgment scenarios. Keep learner submission, review completion, publication, and feedback acknowledgment separate. Use distinct authenticated actors and the actual services, controls, request shapes, and notification entry points.

Required coverage includes all supported expert question types, required validation across pages, restored drafts, exact answer/comment/file payloads, unchanged learner answers, failure/retry paths, duplicate submission prevention, unpublished feedback privacy, published feedback ownership, and persistent read acknowledgment. Cover publication after expert submission; coordinator approval actions, review ratings, and Pulse Check surveys are outside this extension.

Acceptance requires browser typechecking, focused unit regressions, a development build, the reported full unit baseline, and five complete three-profile mocked runs with retries disabled. Prove a successful review response without its completion state fails the UI assertion, then restore the fixture. Keep evidence under output/. Live sandbox execution remains pending at the user's request; mocked acceptance does not verify the backend assignment engine or publication process.

## Coverage matrix

| Phase | Browser assertions |
| --- | --- |
| Learner submission | Required learner answers block submission; required expert-only questions do not. Exact learner answer/context identifiers, duplicate-click prevention, pending review after reload, and removed editing controls. Failed submission retains answers and allows retry. |
| Expert assignment | An unassigned submission produces neither a review entry nor an assignment notice. Pending and "New Submission for Review" each open assessment 501, submission 901 and the correct learner. |
| Expert authoring | Learner answers remain read-only. Shared and expert-only controls honor audience; comments appear only when configured. Text, single/multiple choice, slider, file/image/video, and single/multiple team-member controls save the expected values. Required expert answers span two pages. Confirmed drafts survive navigation and reload; failed autosave exposes Retry save and retains the field. |
| Expert submission | Both newly authored and restored feedback reach submitReview with all intended answers/comments/files and unchanged learner work. Double clicks create one successful request. Successful feedback moves to Completed, removes the assignment notice, and becomes read-only. A failed final request keeps edited feedback and permits retry. A notification-refresh error after successful submission preserves confirmed completion and read-only access. |
| Learner feedback | Assigned but unpublished comments and criteria are hidden. "New Feedback" opens the right assessment. Published feedback shows the expert identity, learner reflection, configured comments, shared answer ownership, every expert control's value, and reviewer-only sections across pages. |
| Learner acknowledgment | Sends updateTodoItem with id=null, identifier="AssessmentSubmission-901", isDone=true. Double clicks create one acknowledgment. The notice disappears, the action becomes Continue after re-entry/reload, and feedback stays viewable. Failure retains the unread notice and permits retry. |

The extra fourteenth scenario reproduces a notification-refresh HTTP 503 after confirmed expert submission and verifies read-only completion, reload and no duplicate submission on every browser profile.

Review publication, completion and read acknowledgment have independent assertions. A success toast alone is insufficient evidence of review completion. Acknowledging the final task follows the existing activity dialog's REVIEW TASKS action before reopening the assessment.

## Fixture lifecycle and contracts

e2e/support/moderation-fixtures.ts defines the identities, groups, answers and todo items. Each case calls seedModeration before navigation and receives fresh browser storage and independent MockState. It authenticates through the actual token-handling flow. Learner and expert use different synthetic API keys and user IDs; interception checks the actor key for every GraphQL request.

Canonical identifiers: program/project 101, timeline 11, activity 301, context 601, assessment 501, learner submission 901, assigned review 1001, learner 701, expert 704. These are synthetic local identifiers, not sandbox values.

| Seed state | Raw submission / review | Notification |
| --- | --- | --- |
| draft | in progress; completed=false; no review | None |
| submitted | pending review; completed=false; no review | None |
| assigned | pending review; completed=false; review in progress | Mentor: AssessmentReview-1001 |
| published | published; completed=false; review done | Learner: AssessmentSubmission-901 |
| read | published; completed=true; review done | None |

The app normalizes published into "feedback available" until acknowledgment; acknowledged feedback normalizes into "done". Learner submission advances only to submitted. Assignment is an independently seeded backend contract. Expert submitReview advances assigned into published; acknowledgment advances published into read. Autosaves change draft answers only. Failure flags preserve the lifecycle state; failed final submission and acknowledgment are one-shot so retry can succeed. failTodoRefresh returns one HTTP 503 after publication without undoing the confirmed review; the browser must keep completion read-only.

The 22-question assessment has ten learner questions (101-110), one shared question (301), and eleven expert criteria (201-211). The existing ten-question page limit yields four physical pages. Learner draft/pending views expose two pages; experts and published-feedback views expose four. Required expert questions include the last-page criterion and a valid slider answer of 0. Choice IDs are globally unique. Canonical learnerWork and publishedReview supply the same intended answers for separately seeded phases.

mock-api.ts projects the actual requested GraphQL fields and rejects unknown operations, IDs, actor permissions and unexpected external requests. Review draft/final requests validate assessment, submission, review and question identifiers. Acknowledgment validates the todo identifier and isDone. Comments are accepted only on configured questions; files use the existing input fields and canonical mocked CDN URLs. Restored files contain the fields selected by the actual query, rather than invented upload metadata. Blank placeholders for non-answerable questions follow the existing final-review contract and cannot overwrite nonempty learner answers.

Assigned review and published feedback notices use the existing todo model, foreignKey and snake_case JSON metadata contracts. Reviews exist only after assignment and appear in Completed after publication. No test relies on execution order or another test's mutation state.

Uploads run the real Uppy Dashboard and TUS client, with isolated length/offset/header validation and the existing WebKit body observer. The image is a 68-byte PNG; the video is a 24-byte synthetic upload payload. These tests cover selection, transfer, file metadata and display. They do not prove video decoding, real storage persistence or live upload delivery.

## Reproduced application defects

- Review autosave marked a field saved before success and did not set failure/retry signals. Pending, confirmed success and failure now update the existing signals accurately.
- Reviewer required validation, answer formatting and loaded-answer normalization treated a numeric 0 as empty. A saved slider value of 0 now validates, persists and reaches the request unchanged.
- A final status refresh rebuilt the expert form from saved data, replacing unsaved answers/comments. Dirty feedback now survives refresh only for the same editable assessment/submission/review. Switching reviews discards it.
- Restored review files lost their separate file input and embedded file metadata in answer. Normalization preserves the file; final payloads separate answer=null from file and strip GraphQL __typename metadata from file inputs.
- Acknowledgment treated updateTodoItem.success=false as success. The service now rejects unsuccessful/missing responses so both desktop and mobile retain the action and allow retry.
- Successful mobile review submission refreshed the review queue but retained its assignment notice. It now refreshes todo items as the desktop flow does.
- A notification-refresh failure could enter the confirmed review submission failure handler and leave the mobile form editable. Both desktop and mobile now keep that ancillary refresh outside submission failure handling; the completed assessment refresh runs first.
- The mobile task omitted contextId, so final-task acknowledgment fetched the assessment with contextId=null. The task now carries its current context through that existing navigation flow.

Each fix has a failing regression and a subsequent focused passing run. Diagnostic selector corrections scope notification buttons to active Ionic pages and wait for confirmed text autosaves before navigation. No public API, dependency, Angular template/module, browser project, server-ownership or sandbox configuration changed.

## Commands and evidence

Run from the repository root using the established toolchain in README.md:

```sh
node e2e/support/launcher.mjs doctor
node e2e/support/launcher.mjs typecheck
node node_modules/typescript/bin/tsc -p projects/v3/tsconfig.spec.json --noEmit
E2E_RUN=moderation-profiles node e2e/support/launcher.mjs mocked --workers=3 e2e/mocked/moderation.spec.ts
node e2e/support/launcher.mjs unit --include=projects/v3/src/app/components/assessment/assessment.component.spec.ts --include=projects/v3/src/app/services/assessment.service.spec.ts --include=projects/v3/src/app/pages/assessment-mobile/assessment-mobile.page.spec.ts --include=projects/v3/src/app/pages/activity-desktop/activity-desktop.page.spec.ts --include=projects/v3/src/app/pages/review-desktop/review-desktop.page.spec.ts
node e2e/support/launcher.mjs unit
node e2e/support/launcher.mjs build
node e2e/support/launcher.mjs repeat --workers=3
```

Serialize unit/build/server launcher invocations: each builds dist/request, so simultaneous builds can remove the library beneath a running server. The default browser configuration still uses one worker. Passing --workers=3 schedules isolated browser contexts concurrently without changing the no-retry policy. Select a single scenario with --grep or one profile with --project; each seed contains everything that phase needs.

| Check | Evidence / outcome |
| --- | --- |
| Toolchain and dependencies | output/moderation/doctor.log: passed |
| Browser typecheck | output/moderation/typecheck.log: passed |
| Jasmine typecheck | output/moderation/unit-typecheck.log: passed |
| Focused unit suites | output/moderation/focused-unit-green.log: 313 passed |
| Three-profile moderation cases | Original 13 cases passed 39/39 in output/moderation/profiles-final.log; the added todo-refresh failure case passed 3/3 in todo-browser-green.log. The complete counted suite below covers all 14. |
| Full unit baseline | output/moderation/full-unit.log, unit-failures.json and unit-summary.json: 1624 total; 1608 passed; the same 16 known failures; no new failure names |
| Development build | output/moderation/build.log: request library and V3 development build passed |
| Publication sensitivity | output/moderation/negative-publication.log and negative-publication-summary.json: completion assertion failed as intended; fixture restored with identical source hash |
| Five complete mocked runs | output/moderation/reliability.log and output/evidence/e2e-1.json through e2e-5.json: 147/147 in each; 735/735 total; no retries, skips or flaky results |
| Source stability and summary | output/moderation/verified-source-hashes.json and final-summary.json: 494 application/browser/build/dependency files unchanged throughout the counted sequence |
| Final review | output/moderation/review-disposition.md: one Important notification-refresh finding reproduced and fixed in one pass |
| Server cleanup | output/moderation/final-port.log: port 4300 released |

The complete suite contains 49 scenarios per profile, including all 14 moderation scenarios. JSON evidence confirms exactly one passed attempt per test, with no skips or flaky cases. The aborted pre-review repetition is diagnostic only and is excluded from these five runs. Earlier advanced per-run results were archived under output/evidence/advanced/ before the shared five-run paths were reused.

Initial diagnostic failures and RED unit logs stay under output/moderation. Current browser screenshots/traces live under output/test-results/<run>/, JSON results under output/evidence/, and the latest HTML report under output/playwright-report/. Preserve named diagnostic evidence when investigating a failure; do not weaken assertions, add retries or exclude unrelated failures.

## Remaining boundaries

Mocked tests prove frontend assignment, publication, access controls and acknowledgment against the current API contracts. Backend authorization, assignment selection and actual publication require separate live integration evidence. Sandbox execution remains pending at the user's request. Coordinator approval, review-rating/Pulse Check surveys, CI, physical devices and external login-app UI remain outside this extension. Existing full-unit and lint blockers are recorded separately in verification.md.
