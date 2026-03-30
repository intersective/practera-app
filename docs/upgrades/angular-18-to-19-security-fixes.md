# Angular 18 → 19 Upgrade & Security Vulnerability Remediation

> **Branch:** `angular-eos-upgrades-prerelease`
> **Date:** March 2026
> **Reason:** 58 npm audit vulnerabilities (8 low, 17 moderate, 33 high), Angular 18 reaching end-of-support
> **Previous upgrade doc:** [angular-17-to-18-ionic-7-to-8.md](angular-17-to-18-ionic-7-to-8.md)

---

## Table of Contents

1. [Motivation](#motivation)
2. [Compatibility Matrix](#compatibility-matrix)
3. [Version Change Summary](#version-change-summary)
4. [Phase 1 — Angular Framework Upgrade](#phase-1--angular-framework-upgrade)
5. [Phase 2 — Companion Library Updates](#phase-2--companion-library-updates)
6. [Phase 3 — Build Tooling & Dev Dependencies](#phase-3--build-tooling--dev-dependencies)
7. [Phase 4 — Request Library](#phase-4--request-library)
8. [Phase 5 — Code Changes & Migration](#phase-5--code-changes--migration)
9. [Phase 6 — Testing & Validation](#phase-6--testing--validation)
10. [Vulnerabilities Addressed](#vulnerabilities-addressed)
11. [Out of Scope](#out-of-scope)
12. [Risks & Rollback](#risks--rollback)
13. [Progress Tracking](#progress-tracking)

---

## Motivation

`npm audit` reported **58 vulnerabilities** after the Angular 17 → 18 upgrade. The majority stem from Angular 18 itself, which has known high-severity XSS and XSRF CVEs patched only in Angular 19+:

| Severity | Count |
|----------|-------|
| High | 33 |
| Moderate | 17 |
| Low | 8 |

Angular 18 is also approaching end-of-support. Upgrading to Angular 19 (latest: **19.2.16**) resolves ~45–50 of the 58 vulnerabilities and keeps the project on a supported major version.

### Key CVEs driving the upgrade

| Advisory | Severity | Description |
|----------|----------|-------------|
| GHSA-58c5 | High | XSRF Token Leakage via Protocol-Relative URLs in HTTP Client |
| GHSA-v4hv | High | Stored XSS via SVG Animation, SVG URL and MathML Attributes |
| GHSA-jrmj | High | XSS via Unsanitized SVG Script Attributes |
| GHSA-g93w | High | XSS in i18n attribute bindings |
| GHSA-prjf | High | Angular i18n XSS |
| GHSA-mw96 | High | Rollup 4 Arbitrary File Write via Path Traversal |
| GHSA-5c6j | High | serialize-javascript RCE via RegExp.flags |
| GHSA-34x7 + 5 more | High | node-tar multiple path traversal / symlink CVEs |
| GHSA-67mh | Moderate | esbuild dev server request leakage |
| GHSA-2g4f | Moderate | ajv ReDoS with $data option |

---

## Compatibility Matrix

Verified compatibility for Angular 19 target:

| Dependency | Current | Target | Angular 19 Support |
|------------|---------|--------|-------------------|
| `@ionic/angular` | ^8.0.0 | ^8.0.0 (unchanged) | ✅ peer dep: `@angular/core >=16.0.0` |
| `@ionic/angular-toolkit` | ^11.0.0 | ^12.3.0 | ✅ latest v12 |
| `apollo-angular` | ^7.0.2 | ^8.0.0 | ✅ v8 peer dep: `@angular/core ^17 \|\| ^18 \|\| ^19` |
| `ngx-quill` | ^26.0.10 | ^27.0.0 | ✅ v27 = Angular 19 per compatibility table |
| `@uppy/angular` | ^0.7.0 | ^1.1.0 | ✅ v1 peer dep: `@angular/core ^17 \|\| ^18 \|\| ^19 \|\| ^20` |
| `ng-circle-progress` | ~1.7.1 | ~1.7.1 (unchanged) | ✅ peer dep: `@angular/core >=14.0.0` |
| `ng-packagr` | ^18.0.0 | ^19.0.0 | ✅ peer dep: `@angular/compiler-cli ^19.0.0` |
| `typescript` | ~5.4.5 | ~5.5.4 or ~5.6.0 | ✅ Angular 19 requires `>=5.5 <5.9` |
| `zone.js` | ~0.14.8 | ~0.15.0 | ✅ Angular 19 compatible (or keep 0.14.x) |
| `rxjs` | ~7.8.0 | ~7.8.0 (unchanged) | ✅ |
| `@types/node` | ^16.11.35 | ^20.0.0 | ✅ aligns with Node 20 runtime, satisfies vite peer |
| Node.js | v20.19.6 | v20.19.6 (unchanged) | ✅ Angular 19 supports `^18.19.1 \|\| ^20.11.1 \|\| ^22` |

---

## Version Change Summary

### dependencies (package.json)

| Package | Before | After | Notes |
|---------|--------|-------|-------|
| `@angular/animations` | ^18.0.0 | ^19.0.0 | |
| `@angular/common` | ^18.0.0 | ^19.0.0 | |
| `@angular/core` | ^18.0.0 | ^19.0.0 | |
| `@angular/forms` | ^18.0.0 | ^19.0.0 | |
| `@angular/platform-browser` | ^18.0.0 | ^19.0.0 | |
| `@angular/platform-browser-dynamic` | ^18.0.0 | ^19.0.0 | |
| `@angular/router` | ^18.0.0 | ^19.0.0 | |
| `apollo-angular` | ^7.0.2 | ^8.0.0 | peer dep added Angular 19 |
| `ngx-quill` | ^26.0.10 | ^27.0.0 | Angular 19 compatibility |
| `@uppy/angular` | ^0.7.0 | ^1.1.0 | major bump; peer dep needs `@uppy/core ^5`, `@uppy/dashboard ^5` |
| `@uppy/core` | ^4.4.4 | ^5.0.2 | required by @uppy/angular v1 |
| `@uppy/dashboard` | ^4.3.3 | ^5.0.2 | required by @uppy/angular v1 |
| `@uppy/drag-drop` | ^4.1.2 | ^5.x (latest) | keep in sync with uppy core |
| `@uppy/progress-bar` | ^4.2.1 | ^5.x (latest) | keep in sync with uppy core |
| `@uppy/remote-sources` | ^2.3.2 | latest compatible | check compatibility with uppy v5 |
| `@uppy/status-bar` | ^4.1.3 | ^5.x (latest) | keep in sync with uppy core |
| `@uppy/xhr-upload` | ^4.3.3 | ^5.x (latest) | keep in sync with uppy core |
| `uppy` | ^4.14.0 | ^5.x (latest) | keep in sync |

### devDependencies (package.json)

| Package | Before | After | Notes |
|---------|--------|-------|-------|
| `@angular-devkit/architect` | ~0.1802.0 | ~0.1902.0 | |
| `@angular-devkit/build-angular` | ^18.0.0 | ^19.0.0 | resolves esbuild, rollup, webpack, serialize-javascript vulns |
| `@angular-eslint/builder` | ~18.4.0 | ~19.3.0 | latest 19 |
| `@angular-eslint/eslint-plugin` | ~18.4.0 | ~19.3.0 | |
| `@angular-eslint/eslint-plugin-template` | ~18.4.0 | ~19.3.0 | |
| `@angular-eslint/schematics` | ~19.4.0 | ~19.3.0 | |
| `@angular-eslint/template-parser` | ~18.4.0 | ~19.3.0 | |
| `@angular/cli` | ^18.0.0 | ^19.0.0 | resolves tmp/external-editor vuln |
| `@angular/compiler` | ^18.0.0 | ^19.0.0 | resolves XSS CVEs |
| `@angular/compiler-cli` | ^18.0.0 | ^19.0.0 | |
| `@angular/language-service` | ^18.0.0 | ^19.0.0 | |
| `@angular/localize` | ^18.0.0 | ^19.0.0 | |
| `@ionic/angular-toolkit` | ^11.0.0 | ^12.3.0 | |
| `@types/node` | ^16.11.35 | ^20.0.0 | aligns with runtime, satisfies vite peer |
| `ng-packagr` | ^18.0.0 | ^19.0.0 | resolves cacache/esbuild vulns |
| `typescript` | ~5.4.5 | ~5.6.3 | Angular 19.2 supports >=5.5 <5.9 |

---

## Phase 1 — Angular Framework Upgrade

### 1.1. Use `ng update` for guided migration

```bash
# update angular core packages
npx ng update @angular/core@19 @angular/cli@19

# update angular build tooling
npx ng update @angular-devkit/build-angular@19
```

`ng update` will:
- apply automatic code migrations (schematics)
- update `angular.json` configuration if needed
- flag any manual migration steps

### 1.2. Manual package.json updates

update all `@angular/*` dependency ranges from `^18.0.0` to `^19.0.0`:
- `@angular/animations`
- `@angular/common`
- `@angular/core`
- `@angular/forms`
- `@angular/platform-browser`
- `@angular/platform-browser-dynamic`
- `@angular/router`
- `@angular/compiler`
- `@angular/compiler-cli`
- `@angular/language-service`
- `@angular/localize`
- `@angular/cli`

update devkit packages:
- `@angular-devkit/architect` → `~0.1902.0`
- `@angular-devkit/build-angular` → `^19.0.0`

### 1.3. TypeScript upgrade

```bash
npm install typescript@~5.6.3 --save-dev
```

Angular 19.2.x requires TypeScript `>=5.5 <5.9`. Current `~5.4.5` is out of range. Target `~5.6.3` for best stability.

**potential breaking changes in TypeScript 5.5–5.6:**
- stricter `isolatedDeclarations` support (opt-in, not breaking)
- `satisfies` operator improvements
- review `tsconfig.json` for any deprecated compiler options

### 1.4. @types/node upgrade

```bash
npm install @types/node@^20 --save-dev
```

aligns type definitions with the actual Node 20 runtime and satisfies vite's peer dependency (`^18 || >=20`).

### 1.5. zone.js

check if `~0.15.0` is needed or if `~0.14.8` still works with Angular 19. Angular 19 docs indicate zone.js `>=0.14.0` is supported, so current version may be fine. verify during install.

---

## Phase 2 — Companion Library Updates

### 2.1. apollo-angular: ^7.0.2 → ^8.0.0

`apollo-angular` v7 declares peer dep `@angular/core ^17 || ^18` — does NOT include ^19.
v8 adds `^19.0.0` to the peer dep.

```bash
npm install apollo-angular@^8.0.0
```

**expected breaking changes:**
- check for API changes in `Apollo` service, `QueryRef`, `MutationRef`
- review import paths — v8 may have changed module exports
- test all GraphQL operations (queries, mutations, subscriptions)

### 2.2. ngx-quill: ^26.0.10 → ^27.0.0

per the ngx-quill compatibility table:
- v26 = Angular 18
- v27 = Angular 19

```bash
npm install ngx-quill@^27.0.0
```

**expected impact:** likely minimal — ngx-quill major bumps typically just update the Angular peer dep.

### 2.3. @uppy/angular: ^0.7.0 → ^1.1.0 (+ uppy ecosystem)

`@uppy/angular` v0.7.0 has a vulnerable transitive dep on `@angular/core` (audit flags it). v1.x requires `@uppy/core ^5` and `@uppy/dashboard ^5`.

this means bumping the entire uppy ecosystem:

```bash
npm install @uppy/angular@^1.1.0 @uppy/core@^5 @uppy/dashboard@^5 \
  @uppy/drag-drop@^5 @uppy/progress-bar@^5 @uppy/status-bar@^5 \
  @uppy/xhr-upload@^5 @uppy/remote-sources@latest uppy@^5
```

**expected breaking changes:**
- uppy v5 API changes (plugin initialization, event names)
- review `UppyUploaderService` and `UppyUploaderComponent` for API differences
- test file upload workflows end-to-end

### 2.4. ng-circle-progress: ~1.7.1 (unchanged)

peer dep `@angular/core >=14.0.0` — no update needed.

---

## Phase 3 — Build Tooling & Dev Dependencies

### 3.1. @angular-eslint: ~18.4.0 → ~19.3.0

```bash
npm install @angular-eslint/builder@~19.3.0 \
  @angular-eslint/eslint-plugin@~19.3.0 \
  @angular-eslint/eslint-plugin-template@~19.3.0 \
  @angular-eslint/schematics@~19.3.0 \
  @angular-eslint/template-parser@~19.3.0 --save-dev
```

peer deps: `eslint ^8.57 || ^9`, `typescript *` — compatible with our eslint@^8.57.0.

### 3.2. ng-packagr: ^18.0.0 → ^19.0.0

```bash
npm install ng-packagr@^19.0.0 --save-dev
```

required for building the `request` library with Angular 19's compiler-cli.

### 3.3. @ionic/angular-toolkit: ^11.0.0 → ^12.3.0

```bash
npm install @ionic/angular-toolkit@^12.3.0 --save-dev
```

### 3.4. @compodoc/compodoc

current `^1.1.18` — check if latest version resolves the ajv vulnerability in its transitive deps. if not, may need `overrides` in package.json for ajv.

### 3.5. eslint ecosystem

current eslint@^8.57.0 is compatible with `@angular-eslint` v19. no change needed.

`eslint-plugin-jsdoc@39.3.6` has engine requirement `^14 || ^16 || ^17 || ^18` but we run Node 20. this is a pre-existing warning (not a vulnerability). consider upgrading to `eslint-plugin-jsdoc@^48` if time permits, or accept the engine warning.

---

## Phase 4 — Request Library

### 4.1. Widen peer dependencies

update `projects/request/package.json` to accept Angular 19:

```json
{
  "peerDependencies": {
    "@angular/common": "^17.0.0 || ^18.0.0 || ^19.0.0",
    "@angular/core": "^17.0.0 || ^18.0.0 || ^19.0.0"
  }
}
```

### 4.2. Rebuild

```bash
npm run prebuildv3  # builds request library
```

verify no compilation errors from the Angular 19 compiler.

---

## Phase 5 — Code Changes & Migration

### 5.1. Angular 19 automatic migrations

`ng update` may apply these migrations automatically:
- **standalone components default:** Angular 19 makes `standalone: true` the default for new components. existing components with `standalone: false` or no `standalone` property continue working unchanged.
- **signal-based inputs/outputs:** Angular 19 promotes signal-based `input()` and `output()` over `@Input()` and `@Output()`. this is opt-in and NOT required for the upgrade. defer to a future PR.
- **`@if`/`@for`/`@switch` syntax:** Angular 19 continues supporting both `*ngIf`/`*ngFor` and the new `@if`/`@for` control flow. no forced migration.
- **inject() function:** Angular 19 encourages `inject()` over constructor injection. this is opt-in. defer to a future PR.

### 5.2. Known breaking changes in Angular 19

review and fix as needed:

1. **`afterRender` / `afterNextRender` phase changes:** these APIs changed to use a single callback with explicit phases. check if any code uses these.

2. **`HttpClientModule` deprecation:** Angular 19 deprecates `HttpClientModule` in favor of `provideHttpClient()`. this is a deprecation warning, not a removal — existing code still works.

3. **stricter type checking in templates:** Angular 19 may surface new template type errors. run `ng build` and fix any new type errors.

4. **`APP_INITIALIZER` deprecation:** replaced by `provideAppInitializer()`. check if the app uses `APP_INITIALIZER` and migrate if needed.

5. **`@defer` blocks:** new feature, no migration needed.

### 5.3. Uppy v5 API changes

review and update as needed:
- `UppyUploaderService` — verify plugin registration API
- `UppyUploaderComponent` — verify template integration
- filestack-related uppy plugins if any (deprioritize per user decision)

### 5.4. apollo-angular v8 API changes

review and update as needed:
- `ApolloService` / `ApolloModule` usage
- `Apollo.use()`, `Apollo.watchQuery()`, `Apollo.mutate()`, `Apollo.query()` signatures
- check for changes in `ApolloModule.forRoot()` vs standalone provider pattern

### 5.5. Lambda@Edge forwarder — S3 path prefix (COMPLETED March 2026)

**Root cause:** The Angular 19 `application` builder (`@angular-devkit/build-angular ^19`) changed the build output structure by introducing a `browser/` subdirectory:

| Builder | Angular version | Output path | S3 key prefix |
|---------|-----------------|-------------|---------------|
| `browser` (webpack) | 17 / 18 | `dist/v3/{locale}/` | `/{locale}/` |
| `application` (esbuild) | **19+** | `dist/v3/browser/{locale}/` | `/browser/{locale}/` |

This mismatch caused `lambda/forwarder/index.js` to rewrite all CloudFront URIs to non-existent S3 keys (e.g. `/en-US/index.html` instead of `/browser/en-US/index.html`). S3 returned `403 AccessDenied` — surfaced as raw XML to every user loading the app.

**Fix applied to `lambda/forwarder/index.js`:**

```javascript
// before (Angular 17/18)
request.uri = "/en-US/index.html";          // fallback
request.uri = `/${locale}/index.html`;      // spa route
// (no static-asset rewrite needed — assets were at root)

// after (Angular 19+)
request.uri = "/browser/en-US/index.html";         // fallback
request.uri = `/browser/${locale}/index.html`;    // spa route
} else if (!request.uri.startsWith('/browser/')) {
    request.uri = `/browser${request.uri}`;         // static assets
}
```

**Validation:** Confirmed working on `p2-stage` after deployment (March 2026).

**Future Angular upgrades:** check `ls dist/v3/` after building to verify the output structure before merging. If thenstructure changes again, update `forwarder/index.js` in the same PR. See `lambda/README.md` for the full dependency documentation.

---

## Phase 6 — Testing & Validation

### 6.1. Build verification

```bash
npm run prebuildv3     # build request library
ng build v3            # production build
```

### 6.2. Unit tests

```bash
npm test               # run full test suite
```

target: all existing tests pass. fix any failures introduced by the upgrade.

### 6.3. Lint

```bash
npm run lint           # eslint with angular plugin
```

### 6.4. Audit verification

```bash
npm audit              # verify vulnerability count reduction
```

target: resolve all high-severity Angular/build-tool vulnerabilities (~45–50 of 58).

### 6.5. Manual testing checklist

- [ ] login flow (staging)
- [ ] assessment creation, save, submit
- [ ] file upload via uppy
- [ ] rich text editor (quill)
- [ ] chat functionality
- [ ] activity/topic navigation
- [ ] review flow
- [ ] i18n rendering

### 6.6. Save test output

```bash
# save full test run output
npm test > ./output/angular-19-upgrade-tests.log 2>&1

# save audit results
npm audit > ./output/angular-19-upgrade-audit.log 2>&1
```

---

## Vulnerabilities Addressed

### Resolved by Angular 19 upgrade (~45–50 vulns)

| Root Cause | Vulns | How Resolved |
|------------|-------|-------------|
| `@angular/core` <= 18.2.14 (XSS, XSRF) | ~15 | `@angular/core` ^19.0.0 |
| `@angular/compiler` <= 18.2.14 (XSS) | ~10 | `@angular/compiler` ^19.0.0 |
| `@angular/common` <= 19.2.15 (XSRF) | ~8 | `@angular/common` ^19.0.0 |
| esbuild <= 0.24.2 (dev server leak) | ~3 | via `@angular/build` v19 |
| rollup 4.0–4.58 (path traversal) | ~1 | via `@angular/build` v19 |
| webpack 5.49–5.104 (SSRF) | ~2 | via `@angular-devkit/build-angular` v19 |
| serialize-javascript <= 7.0.2 (RCE) | ~1 | via `copy-webpack-plugin` in build-angular v19 |
| vite (transitive via esbuild) | ~1 | via `@angular/build` v19 |
| ajv 7–8.17.1 (ReDoS) | ~5 | via `@angular-devkit/core` v19 |
| tar <= 7.5.10 (in cacache) | ~2 | via updated cacache in Angular 19 deps |
| tmp <= 0.2.3 (symlink write) | ~2 | via `@angular/cli` v19 |

### NOT resolved (out of scope)

| Root Cause | Vulns | Reason |
|------------|-------|--------|
| `aws-sdk` v2 in `serverless@^3` | ~2 | dev/deploy-only; serverless v4 upgrade deferred |
| `tar` in `serverless@^3` | ~2 | dev/deploy-only; serverless v4 upgrade deferred |
| `file-type` in `filestack-js` | ~2 | filestack slated for deprecation; acceptedisk |
| `file-type` in `@serverless/utils` | ~1 | dev-only transitive dep |

---

## Out of Scope

1. **Serverless v3 → v4 upgrade** — deferred. `serverless` and `aws-sdk` vulnerabilities are dev/deploy-only tools, not shipped to end users. accepted risk.
2. **Filestack vulnerabilities** — `filestack-js` has a transitive `file-type` vulnerability. filestack is being deprecated from the app. no investment in fixing.
3. **Signal-based inputs/outputs migration** — Angular 19 feature. opt-in, not required. defer to a separate PR.
4. **Standalone component migration** — Angular 19 defaults new components to standalone. existing components continue working. defer to a separate PR.
5. **`inject()` function migration** — Angular 19 feature. opt-in, not required. defer.
6. **Remaining `.toPromise()` migration** — 22 call sites identified in the 17→18 upgrade doc still use deprecated `.toPromise()`. defer to a separate PR.

---

## Risks & Rollback

| Risk | Mitigation |
|------|-----------|
| apollo-angular v8 API breaking changes | test all GraphQL operations; keep v7 as fallback |
| uppy v5 breaking changes in file upload | test upload flows thoroughly; can pin @uppy/angular@0.7.0 with `overrides` as fallback |
| TypeScript 5.6 stricter checks | incremental fix of any new type errors |
| ngx-quill v27 regressions | minimal risk — usually just peer dep bump |
| CI build failures | run full CI pipeline before merging |
| **Lambda@Edge S3 path mismatch** (**occurred** March 2026) | Angular 19 `application` builder adds `browser/` subdirectory; `lambda/forwarder/index.js` must be updated in the same PR — see §5.5 |

**Rollback plan:** revert to the pre-upgrade commit on `angular-eos-upgrades-prerelease` branch. all changes are confined to `package.json`, `package-lock.json`, and targeted source fixes.

---

## Progress Tracking

### Implementation Checklist

- [ ] **Phase 1:** Angular 18 → 19 framework packages
  - [ ] run `ng update @angular/core@19 @angular/cli@19`
  - [ ] update remaining `@angular/*` packages
  - [ ] upgrade TypeScript to ~5.6.3
  - [ ] upgrade `@types/node` to ^20
  - [ ] verify zone.js compatibility
  - [ ] resolve any `ng update` migration warnings
- [ ] **Phase 2:** Companion libraries
  - [ ] `apollo-angular` ^7 → ^8
  - [ ] `ngx-quill` ^26 → ^27
  - [ ] `@uppy/angular` ^0.7 → ^1.1 + uppy ecosystem v5
- [ ] **Phase 3:** Build tooling
  - [ ] `@angular-eslint/*` → ~19.3.0
  - [ ] `ng-packagr` → ^19.0.0
  - [ ] `@ionic/angular-toolkit` → ^12.3.0
  - [ ] `@angular-devkit/build-angular` → ^19.0.0
  - [ ] `@angular-devkit/architect` → ~0.1902.0
- [ ] **Phase 4:** Request library
  - [ ] widen peer deps to include ^19.0.0
  - [ ] rebuild and verify
- [ ] **Phase 5:** Code fixes
  - [ ] fix any new TypeScript / template errors
  - [ ] update uppy service/component if API changed
  - [ ] update apollo-angular usage if API changed
  - [ ] fix any Angular 19 deprecation warnings
  - [x] update `lambda/forwarder/index.js` for `browser/` path prefix *(completed March 2026)*
- [ ] **Phase 6:** Validation
  - [ ] `npm run prebuildv3` succeeds
  - [ ] `ng build v3` succeeds
  - [ ] `npm test` passes
  - [ ] `npm run lint` passes
  - [ ] `npm audit` shows reduced vulnerability count
  - [ ] manual testing on staging
    - [ ] verify app loads at `https://app.<stack>.practera.com/en-US` without S3 AccessDenied
    - [ ] verify deep-links with query params (magic-link login) resolve to correct locale
