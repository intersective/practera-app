# App testing

This is the testing SSOT for `chaw-login-refactor-e2e`. Tests use the actual Angular 21 / Ionic 8 application and its services. Karma/Jasmine remain the unit runner. Playwright 1.63.0 supplies browser automation. No CI or external login-app UI automation is included.

## Reproducible setup

Use Node 22.23.2, recorded in `.node-version`. The launcher requires the exact version to make results comparable. It also verifies the project's local npm 11.6.2 rather than modifying global npm.

From the repository root:

```sh
mkdir -p output/toolchain output/npm-cache output/tmp
npm_config_cache="$PWD/output/npm-cache" TMPDIR="$PWD/output/tmp" \
  npm install --prefix output/toolchain --no-save --package-lock=false \
  --ignore-scripts --no-audit --no-fund npm@11.6.2
npm run test:install
npm run test:doctor
npm run test:browsers
npm run test:build
```

`test:install` runs npm 11.6.2 `ci --include=dev` against the committed lockfile. Preserve the documented Uppy peer exception in `.npmrc`. `test:doctor` checks every direct installed dependency against the lockfile. It does not certify missing transitive peer dependencies or runtime correctness.

Installation scripts were reviewed for existing native packages (parcel watcher, esbuild, lmdb, msgpackr, optional fsevents) and maintenance notices (aws-sdk, core-js, es5-ext). Playwright's exact official package and browser revisions are pinned together. Review scripts again when changing the lockfile; do not add peer exceptions or force upgrades to pass tests.

The launcher places caches, temporary directories, browser binaries and diagnostics under ignored `output/`. It uses the existing repository-owned `.angular/cache` and `dist/` build directories. If the ignored baseline `environment.ts` is missing, it is initialized from the committed local environment; existing files are preserved. Unit tests, the development build and test-server startup build the `request` library first. Karma uses the installed, pinned Playwright Chromium binary; install browsers before running unit tests.

Risk: npm installation scripts and browser installation execute or download software.
Reason: existing native build tools and browser tests require executable binaries.
Safer alternative: use the reviewed lockfile, explicit pinned browser installation, and repository-local paths. Do not use global Playwright, an unpinned `npx` download, or the existing Alpine container for WebKit.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run test:unit` | Full V3 Karma suite |
| `npm run test:lint` | Existing V3 lint gate |
| `npm run test:build` | Request library and V3 development build |
| `npm run test:serve` | Manually run the mocked frontend on port 4300 |
| `npm run test:e2e:typecheck` | Browser tests and configuration typecheck |
| `npm run test:e2e` | All mocked tests, three browser projects |
| `npm run test:e2e -- --project=desktop-chromium` | One browser project |
| `npm run test:e2e:headed` | Headed browser debugging |
| `npm run test:e2e:repeat` | Five full consecutive runs, zero retries |
| `npm run test:e2e:report` | Open the latest mocked HTML report |
| `npm run test:sandbox` | Explicit real-backend smoke suite |
| `npm run test:privacy` | Synthetic live-failure diagnostic privacy check, without credentials |
| `node --test e2e/support/launcher.test.mjs` | Launcher validation tests |

Playwright owns `http://localhost:4300` and refuses to reuse another server. Stop an existing process yourself or wait for its run to finish. Leave Angular's Ionic/Stencil `prebundle.exclude` intact.

Restricted agent execution can prevent Angular workers, Chrome startup, or local-port binding. Retry with the environment's permitted execution path; these restrictions are not application failures.

## Mocked regression suite

Projects are desktop Chromium (1280 x 800), Pixel 7 Chromium, and iPhone 13 WebKit. Mobile emulation proves browser behavior, not physical-device acceptance. `environment.e2e.ts` has public synthetic endpoints, `demo: false`, and pagination enabled.

`e2e/support/mock-api.ts` installs interception before navigation. Each test receives fresh browser storage and an isolated backend state. The fixture projects requested GraphQL fields from actual service queries, checks identifiers, records operations, saves drafts, and changes submission status. Root fields without handlers and unexpected external requests fail the test. WebSockets and external fonts are intercepted; no live API is required.

Fixtures contain two programs, one activity/topic, and an ordinary 11-question assessment. Choice IDs must be globally unique, matching real backend data. Extend fixture responses to the actual operation/variables and response shape when services change; never respond with blanket empty success data.

Authentication tests cover the outgoing global-login boundary and actual returned-token processing. They do not prepopulate `isLoggedIn` or claim coverage of the external login UI. Assessment tests interact with real controls, verify pagination and restored drafts, inspect submitted answers, and exercise retry paths. Prefer roles/labels; do not use forced clicks or fixed waits.

## Sandbox smoke

Set these variables through your shell or a private secret manager:

- `APP_TEST_TOKEN`: fresh token for a dedicated sandbox learner.
- `APP_TEST_PROGRAM_NAME`: exact accessible program name.
- `APP_TEST_ACTIVITY_NAME`: exact activity name.
- `APP_TEST_TOPIC_NAME`: exact topic task name.
- `APP_TEST_ASSESSMENT_NAME`: exact assessment task name.

Do not place credentials in source, command history, or documentation. The launcher checks these values before starting any server and never prints their values. Missing values exit nonzero with instructions.

Sandbox configuration uses the public p2-sandbox API endpoints. The token is injected into the parameterless `/auth/jwt` handoff via session storage, never a token-bearing URL. Actual authentication and program data come from sandbox. Only desktop Chromium runs live smoke.

The smoke test opens program/activity/topic/assessment pages and logs out without editing answers or completing topics. Interception blocks GraphQL mutations, REST writes, WebSockets and external integrations. Logout navigation is intercepted at the external login boundary. Trace, screenshot, video and automatic page snapshots in failure context are disabled. Live failures report only the named stage, close the page, and omit original selector/error details; launcher output is token-redacted and saved to `output/evidence/sandbox.log`. The sandbox launcher rejects command-line overrides and removes inherited debug flags so capture cannot be enabled through that command. Use the launcher, not a raw Playwright invocation, for live credentials. `test:privacy` deliberately fails a synthetic live-style interaction and checks persisted diagnostics for synthetic credential and learner markers; it is not live acceptance.

Use a dedicated account with stable enrolled data. Invalid/expired tokens or unavailable data are failures of live acceptance, not a reason to replace responses with mocks. Live execution is a separate gate from the mocked regression suite.

## Evidence and remaining gates

- `output/evidence/`: dependency/build/unit logs and per-run browser JSON results.
- `output/playwright-report/`: latest mocked HTML report.
- `output/test-results/`: mocked failure screenshots/traces, grouped by run.
- [Verification results](verification.md): checked outcomes and baseline blockers.

Sandbox execution is pending at the user's request. The milestone requires a reproducible clean setup, successful development build/server, relevant unit regressions, five complete retry-free browser runs, and successful sandbox smoke. Keep unrelated baseline failures visible. Do not claim completion of live acceptance when credentials are absent. Future work includes CI, physical devices, external login UI and broader learner features.
