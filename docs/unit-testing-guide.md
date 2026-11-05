# Unit testing

## Local setup

Use Node 20.20.2 and npm 10.8.2, matching the release/live PR workflow.
Each worktree needs its own locked dependencies. An ancestor checkout's
node_modules can silently supply incompatible Angular or Apollo versions.

Run from the worktree root:

```sh
npm ci --ignore-scripts --no-audit --no-fund --cache ./output/npm-cache
test -f projects/v3/src/environments/environment.ts || cp projects/v3/src/environments/environment.local.ts projects/v3/src/environments/environment.ts
npm run prebuildv3
npm test -- --progress=false
./node_modules/.bin/ng test request --watch=false --progress=false
```

The environment file and dist/request are generated, ignored inputs. The local
template supplies stackName for uploader configuration. Preserve an existing
environment file; if it predates that field, add the appropriate local stackName.
Install scripts remain disabled, as in CI. No dependency additions are needed.
Karma needs permission to bind localhost:9876 and launch ChromeHeadless. Run the
suites sequentially because they share that port. A sandbox port error is an
execution restriction, not an assertion failure.

Keep logs and caches under output/, which is already ignored. npm test runs
only v3; run request separately. The release/live PR workflow prepares the
environment and request build before running the app suite.

## Test repair conventions

- Preserve release/live behavior and existing test coverage. Do not copy trunk
  features or change production behavior merely to make a test pass.
- Reproduce failures with the complete suite. Fix compile errors before
  interpreting runtime counts; a load error means no assertions ran.
- Supply real lifecycle arguments and complete typed fixtures rather than
  casting away contract errors.
- Shared test.ts provides overlay controller fallbacks. A suite asserting its
  own controller spy must override that provider before creating the fixture.
- Mock delegated utility results explicitly, avoid spying twice on a spy, and
  restore environment values after tests that mutate them.
- Keep presentation labels branch-specific. Use distinct body text in PDF
  fixtures so filtering section headings cannot accidentally count body text.
- Model Team360 non-peer sections explicitly. A selector-bearing section at
  index zero is a peer section; its position does not make it a self section.
- Do not add focused or skipped tests, increase retries/timeouts, or exclude
  failing suites. Existing disabled tests are outside this repair.

## Compatibility record

Repair base: live-unittest at d85c2035d (release/live).
Reference: unit-test-reinstate-on-trunk at 1218e428e.
These are inspected local references, not a claim of current remote freshness.

| Repair | Relationship to reference | Carry-back treatment |
| --- | --- | --- |
| Review-list SimpleChange import and segment event | Exact reference spec | Already present |
| Support-popup uploader import and typed file factory | Exact reference spec | Already present |
| Removed obsolete video ngOnInit test and unused logout assert import | Exact reference specs | Already present |
| Local stackName | Same field/value as reference; excludes snow configuration | Already present |
| Assessment scrollToTop property definition | Same fix as d64294931 | Already present |
| AssessmentService expected projectBrief: null | Same reference expectation | Already present |
| Chat empty-content utility result and existing alert spy | Same reference fixes | Already present |
| Hubspot region setup and restoration | New environment-independent fixture setup | Portable |
| PDF overview body distinct from heading | New fixture disambiguation | Portable; retain target labels |
| Modal Overview/Sector expectations | Matches release/live model labels | Release-specific; retain trunk's Project Overview/Industry |
| Team360 explicit non-peer leading group | Corrects release fixture's positional assumption | Port only if target has equivalent semantic section behavior |

Select test-only hunks when carrying work back. Do not merge release/live's
feature history or replace large specs wholesale. In particular, preserve
release-specific file-upload, assessment, Home, and project-brief coverage;
trunk compression, navigation-state, snow, and attention features are not part
of this repair. Validate both suites on the target branch before calling a
carry-back successful.

## Repair evidence (2026-11-05)

- Original prepared app baseline: 18 TypeScript diagnostics and one unresolved
  uploader module; app tests did not execute.
- After compilation repairs: 1457 passed, 15 failed, 16 pre-existing skipped.
- Runtime causes: missing expected projectBrief field, unconfigured Hubspot
  region, PDF body/heading collision, read-only Ionic method mocking, incorrect
  Team360 fixture shape, stale modal labels, and chat spy setup.
- Final verification: app suite passed twice with 1472 successes and the same
  16 existing skips; focused repaired suites passed 363 tests (6 existing skips);
  request suite passed all 23 tests. All commands exited zero.
- Independent read-only diff review found no important issues; git diff --check
  passed. No production defects required separate repair.
- Logs: output/unit-runtime-fixes.log, output/unit-focused.log,
  output/unit-final.log, and output/request-unit-final.log.
- Production code, dependency versions, shared bootstrap, and Karma settings
  remain unchanged. No additional disabled tests were introduced.

Execution logs are local artifacts under output/. Hosted CI and the trunk
reference branch need their own validation; local success does not establish
those results.
