# Verification results

Checked 2026-10-02 on `chaw-login-refactor-e2e`. This document separates new-suite evidence from full baseline and live acceptance.

The foundation results below describe the first implementation. The advanced extension has its own results at the end of this document; its current full unit baseline supersedes the older counts.

## Established evidence

- npm 11.6.2 clean lockfile installation passed with development dependencies.
- Direct installed dependencies match package-lock.json.
- Request library and V3 development build passed with permitted local worker execution.
- Chromium and WebKit binaries installed under output/browsers.
- Final focused authentication, program-switching, draft and assessment selection: 17 passed using pinned Chromium 153.
- Launcher validation: 3 passed.
- Synthetic live-failure privacy probe passed after a failing reproduction showed raw selector/page content in failure artifacts.
- Login regression first failed against the stale mock, then passed after correcting the mock to deprecatingLogin and switchProgram.
- Browser TypeScript check passed.

## Assessment regressions repaired

Browser testing exposed application defects in the critical assessment journey. Focused unit regressions and browser assertions reproduced these failures before minimal fixes:

- An unanswered multiple-choice input called indexOf on undefined and stopped rendering its final choice. It now treats a missing answer as an empty array.
- Required answers entered before the delayed form subscription could leave Submit disabled. Validation now includes the current form value when subscribing.
- Retry save could be dropped while an asynchronous failure toast opened. The save stream now reconnects before awaiting the toast.
- Ionic replaced the interactive retry icon's button role after SVG loading. A native button now owns the interaction and accessible name.
- Same-submission status refreshes discarded dirty answers and reset the current page before reporting submission failure. Local edits and page position now survive refreshes of the same editable submission; another submission gets fresh state.
- Retrying assigned properties on signal functions instead of updating failed/saved values. Correct signal updates now clear the stale failure indicator.
- Delayed validation could subscribe after component destruction, and pending debounce could flush on teardown. An owned timer and cancellation after debounce now prevent both; two teardown regressions failed before the fix and passed afterward.

The existing Stencil development runtime can report an onAriaChanged watcher error during dynamic Ionic control creation. Chromium reports "Cannot read properties of undefined (reading 'onAriaChanged')"; WebKit reports "undefined is not an object (evaluating 'instance[watchMethodName]')" at the same Stencil setAttribute watcher path. Only these exact messages with that stack path are attached to browser results as SDK warnings. Other browser exceptions and Angular TypeError/ReferenceError diagnostics fail mocked tests. This is a recorded dependency/runtime limitation; functional assertions remain enforced. Vite's HMR connection is intentionally blocked with other WebSockets.

## Full baseline

- Initial restricted build/test attempts terminated by the environment; permitted execution runs the suite.
- Initial full V3 baseline with installed Chrome 154: 1583 tests, 1549 passed, 34 failed.
- Final full V3 run with pinned Chromium 153: 1595 tests, 1563 passed, 32 failed. No new failure names. The two unchanged EventService cases passed in this run; this does not claim a fix for their inconsistent baseline result. All other listed baseline failures remain.
- Final focused run: 17/17 passed; the full suite is still a failing gate.
- Lint remains blocked by missing existing @typescript-eslint/utils peer after clean installation. No extra dependency was added to hide this.
- Angular reports existing Browserslist/Sass/CommonJS warnings.

Baseline failing tests:

- AssessmentComponent CORE-8277: reviewer-only feedback group visibility should render one dedicated reviewer feedback heading
- AssessmentComponent CORE-8277: reviewer-only feedback group visibility should render one accessible guidance callout for consecutive reviewer-only groups
- AssessmentComponent isPaginationEnabled should return the value from environment feature toggles
- AssessmentComponent goToPage() should reset the nearest mobile ion-content after numbered navigation
- AssessmentComponent Team 360 minimum pages enforcement setSubmissionDisabled() team 360 enforcement requires the first peer group, not completion of every later peer group
- BottomActionBarComponent onClick() should show loading immediately and prevent duplicate clicks when opted in
- MultiTeamMemberSelectorComponent should render the learner ownership chip before the selected member
- MultipleComponent when testing display-only preview mode should use Your Answer for learner selections in learner view
- MultipleComponent when testing display-only preview mode should show only reviewer selections without ownership labels in reviewer feedback
- MultipleComponent when testing display-only preview mode should normalise stringified selected choice arrays
- OneofComponent read-only ownership context should use ownership labels for a shared question
- OneofComponent read-only ownership context should show only the selected value without a label in reviewer feedback
- ProjectBriefModalComponent downloadPdf() shows loading, ignores duplicate selections, and restores the button after success without closing
- ProjectBriefModalComponent template rendering renders the full ordered version 2 brief with organisation details and learner download shell
- ProjectBriefModalComponent template rendering renders duplicate chip labels without dropping learner data
- ProjectBriefModalComponent template rendering should use the primary brand color for section header icons
- ProjectBriefModalComponent template rendering should use the dark color for project brief chips
- SliderComponent reviewer-only display should use the reviewer answer as the displayed slider value
- SliderComponent reviewer-only display should use reviewer-specific wording when no review answer exists
- SliderComponent should use ownership labels for a shared slider in learner view
- TeamMemberSelectorComponent should render the learner ownership chip before the selected member
- TopicComponent actionBtnClick should open new tab for url without preview-supported extension
- ChatPreviewComponent previewUrl should render the immediate preview URL when it is available
- EventService when testing getEvents() should get correct data
- EventService when testing getEvents() should get correct multi day events
- HubspotService when testing submitDataToHubspot() should return correct user role "Learner"
- HubspotService when testing submitDataToHubspot() should return correct user role "Expert"
- HubspotService when testing submitDataToHubspot() should return same user role if it not match
- HubspotService when testing submitDataToHubspot() should return empty string for "firstname" if it not found
- HubspotService when testing submitDataToHubspot() should return empty string for "lastName" if it not found
- HubspotService when testing submitDataToHubspot() should return empty string for "contactNumber" if it not found
- HubspotService when testing submitDataToHubspot() should return empty string for "teamName" if it not found
- HubspotService when testing submitDataToHubspot() should return empty string for "hs_file_upload" if it not found
- ProjectBriefPdfService writes organisation metadata and the existing presentation sections in their defined order

## Browser and sandbox gates

All 11 required mocked scenarios passed on each of the three browser projects: 33/33. The owned dev server started successfully on port 4300 and stopped after each run. A final listener check confirmed port 4300 was released. Five consecutive complete runs passed with retries disabled: 33/33 in each, 165/165 total, zero skips and zero flaky results. Each test has exactly one successful attempt in the JSON evidence.

Negative-fixture proof: replacing the two-program response with an empty list caused the token-handoff program-button assertion to time out and the strict API-variable check to reject empty project identifiers. The original fixture was restored before subsequent checks. See output/evidence/negative-fixture.log and output/test-results/negative-fixture/.

Sandbox smoke is implemented and pending at the user's request. The missing-credential preflight previously exited nonzero before server startup, with no secret values printed. Live acceptance is not complete.

The live diagnostic privacy reproduction first retained a synthetic credential and learner page content in error-context.md. The fix disables automatic page snapshots, wraps live failures with static stage errors, and closes the page. The final synthetic probe checks all its persisted results and redacted log for both markers and passes; no live credentials were used. This proves the configured failure path, not real sandbox integration.

Full logs and per-run machine-readable results stay in ignored output/evidence.

## Final review decisions

One fresh reviewer examined the complete change. Important findings received one fix pass:

- Live failure diagnostics: synthetic RED/GREEN privacy proof, capture disabled and sanitized stage errors.
- Validation teardown: both delayed subscription and pending debounce regressions reproduced, then passed after cancellation fixes.
- Task selectors: regraded as important because real tasks can include due/status text. Shared selectors identify the exact task heading within its button, used by all mocked browser projects and the live suite. The desktop settings selector is also scoped to the home banner to avoid duplicate headers.

Rulings:

- Keep the requested existing branch; introducing a separate worktree would move the user's selected working context. Cost if wrong: later branch isolation may be needed.
- Record the exact Stencil watcher messages instead of upgrading the SDK in this testing change. Functional assertions and other exceptions remain enforced. Cost if wrong: an SDK-specific failure could require a separate runtime fix.
- Retain unrelated unit failures and the lint dependency blocker without exclusions or extra packages. Cost if wrong: the overall test gate remains unavailable until separate repairs.
- Do not expand existing save-stream ownership beyond the reviewed validation teardown fix. Cost if wrong: broader lifecycle defects need their own regression coverage.
- Keep real sandbox execution pending as requested; mocked success is separate. Cost: live integration remains unverified.
- Keep external login UI, CI, physical devices, chat/uploads and broad assessment variants deferred according to the approved scope. Cost: those paths have no new acceptance evidence.
- Keep repository-owned evidence and changes uncommitted for review; do not publish or remove inspectable output. Cost: ignored artifacts need to be retained locally if sharing evidence later.

No deferred minor findings remain after the task-selector issue was regraded.

## Final evidence locations

| Evidence | Location |
| --- | --- |
| Clean installation and initial baselines | output/evidence/clean-install.log and baseline-*-restored.log |
| Final development build | output/evidence/final-build.log |
| Relevant unit regressions | output/evidence/final-critical-unit.log |
| Full unit result | output/evidence/final-unit.log |
| Lint blocker | output/evidence/final-lint.log |
| Foundation five-run browser sequence | output/evidence/foundation/reliability.log |
| Foundation per-run results | output/evidence/foundation/e2e-1.json through e2e-5.json |
| Negative fixture proof | output/evidence/negative-fixture.log |
| Privacy probe | output/evidence/final-privacy.log and output/test-results/privacy/ |
| Machine-readable final summary | output/evidence/final-summary.json |
| Latest browser HTML report | output/playwright-report/index.html |

## Advanced extension: 2026-10-02

The requested extension adds 24 scenarios to the original 11. The complete suite now has 35 scenarios on each of desktop Chromium, Android-profile Chromium and iPhone-profile WebKit (105 executions per run). The [advanced coverage matrix](advanced-coverage.md) records the exact states and defects. No dependency versions changed, no live files were uploaded, and sandbox smoke remains pending by request.

Verified local checks:

- Direct dependency versions still match the lockfile; Node 22.23.2 and local npm 11.6.2 remain pinned.
- Request library and V3 development build pass. Every browser invocation starts and stops its own frontend server.
- Browser and Jasmine TypeScript checks pass.
- Focused Settings, FastFeedback, FileUpload, Multiple, Text and Home suites: 192 passed. Assessment, Oneof, Slider, both team selectors and BottomActionBar: 426 passed. All 618 focused cases also pass in the final full run, which exercises globally registered Ionic elements.
- Final full baseline: 1604 tests, 1588 passed, 16 failed. Nine new unit regressions were added. The original assessment/choice/slider/selector/action-bar failure names are now resolved by the documented product fixes and corrected fixtures. No new full-suite failure names appeared.
- Remaining full-suite failures: five ProjectBriefModal cases, one Topic external-link case, one ChatPreview URL case, eight Hubspot mapping cases, and one ProjectBriefPdfService case. Their exact names are in output/evidence/advanced/unit-failures.json; all were already recorded above. EventService's unchanged cases passed in this run; their historical inconsistency remains unclaimed.
- Lint still exits nonzero because the existing @typescript-eslint/utils peer is absent. No extra package or exclusion was added.
- Negative feedback proof: temporarily replacing available feedback questions with an empty list made the positive modal assertion fail (zero modals instead of one). The fixture was restored in a finally block before subsequent validation.
- The initial three-profile diagnostic run failed 9/105, reproducing comment autosave, mobile links, hidden-button selector and WebKit Blob-observation issues. The focused WebKit follow-up passed 4/4 after correction. This diagnostic run is separate from final reliability evidence.
- A subsequent diagnostic run passed 104/105. The remaining desktop test had assumed a selected review survives reload; it now reselects the review through the actual list before checking persisted comments. The five-run sequence was restarted from the final code. See output/evidence/advanced/reload-diagnostic.log and reload-diagnostic.json.

Five complete consecutive runs passed with three isolated workers and zero retries: 105/105 per run, 525/525 total, zero skips and zero flaky results. JSON evidence confirms 35 scenarios per browser and exactly one successful attempt for every test. Application and browser-test source hashes stayed unchanged throughout the counted sequence. The final port-binding check confirms port 4300 is released. The default configuration remains one worker; the tested repetition command is `npm run test:e2e:repeat -- --workers=3`.

One fresh final reviewer examined the extension and found no important issues. Subsequent minimal comment/mobile-route/single-choice fixes and stale unit fixture repairs were checked with their failing regressions, the full unit run and browser checks. Sandbox and physical-device acceptance remain separate gates.

| Advanced evidence | Location |
| --- | --- |
| Request and V3 development build | output/evidence/advanced/final-build.log |
| First focused unit selection | output/evidence/advanced/final-focused-unit.log |
| Additional assessment unit selection | output/evidence/advanced/assessment-baseline-green.log |
| Final full unit baseline | output/evidence/advanced/final-full-unit-v2.log |
| Exact remaining unit failures | output/evidence/advanced/unit-failures.json |
| Lint dependency blocker | output/evidence/advanced/final-lint.log |
| Negative feedback proof | output/evidence/advanced/negative-feedback.log |
| Browser reliability sequence | output/evidence/advanced/reliability.log |
| Current per-run browser results | output/evidence/e2e-1.json through e2e-5.json |
| Final summary and source stability | output/evidence/advanced/final-summary.json and verified-source-hashes.json |
| Final server cleanup | output/evidence/advanced/final-port.log |
