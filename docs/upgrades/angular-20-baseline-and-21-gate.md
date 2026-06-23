# Angular 20 baseline and Angular 21 gate

Related planning note: [Angular 21 evaluation for `projects/v3`](./angular-21-evaluation-v3.md)

## Current baseline

`projects/v3` and the internal `projects/request` library are pinned to an Angular 20 baseline:

- Angular runtime packages: `20.3.x`
- Angular CLI/build tooling: `20.3.x`
- TypeScript: `5.9.x`
- Zone.js: `0.15.x`
- Ionic Angular: `8.8.x`
- npm is the package manager source of truth; keep `package-lock.json`.

Use Node.js `20.20.2` or newer in the Angular-supported Node 20 range. Local, Docker, GitHub Actions, and CodeBuild should use Node 20+ and local Angular CLI commands from `node_modules/.bin/ng`.

## Upgrade constraints

The app remains NgModule-based and Zone-based for this upgrade. Do not convert to standalone components, zoneless change detection, or the new application builder as part of the Angular 20 baseline.

Compatibility cleanup applied for the Angular 20 baseline:

- `CanLoad` routes/guards were moved to `CanMatch`.
- `toPromise()` call sites were moved to `firstValueFrom()`.
- `throwError(value)` call sites were moved to `throwError(() => value)`.
- HTTP tests use `provideHttpClient()` and `provideHttpClientTesting()` instead of deprecated HTTP testing modules.
- `projects/v3/.browserslistrc` was aligned with Angular 20-supported browser targets.
- `v3` remains on the classic Angular browser builder instead of the newer application builder.
- Karma tests use the classic browser builder mode instead of the application/esbuild test path.
- Apollo Angular v14 no longer uses the old module import path for this NgModule app. Keep `Apollo` in `AppModule.providers` because `ApolloService` still owns the existing `apollo.createDefault(...)` lifecycle. GraphQL fetches should call `ApolloService.initiateCoreClient()` before querying so direct-login routes can run before the normal app startup services complete.
- Do not send `Access-Control-Allow-Origin` as a request header from the Apollo client. That header belongs on server responses and breaks localhost auth flows with a browser CORS preflight failure.
- Unused dependency risk was reduced by removing unused text mask, Intercom, and unused Uppy package entries from the root manifest.
- `@uppy/status-bar` remains as an explicit dependency because `@uppy/angular@1.1.0` imports it directly.

## Angular 21 gate

Do not force Angular 21 through peer dependency gaps. Proceed only when Ionic officially supports Angular 21 and `@uppy/angular` supports Angular 21, or after replacing the Uppy Angular wrapper with an internal wrapper over Uppy core/dashboard.

When the gate is satisfied, upgrade with one major step:

```sh
npx ng update @angular/core@21 @angular/cli@21
```

Expected Angular 21 target:

- Angular runtime packages: `21.2.x`
- Angular CLI/build tooling: `21.2.x`
- `ng-packagr`: `21.2.x`
- `ngx-quill`: `30.1.x`
- TypeScript: `>=5.9 <6.0`
- Zone.js: `~0.15.0 || ~0.16.0`

## Verification

After dependency or migration changes, run:

```sh
npm run lint
node_modules/.bin/ng build request --configuration=development
node_modules/.bin/ng build v3 --configuration=development
node_modules/.bin/ng test v3 --no-watch --browsers ChromeHeadless
```

If `projects/v3/src/environments/environment.ts` is missing locally, copy it from `projects/v3/src/environments/environment.local.ts` before build/test.

## Dependency risk notes

Risk: install scripts and transitive maintenance debt.
Reason: dependency installation currently reports deprecated transitive packages and audit findings.
Safer alternative: keep using npm with `package-lock.json`, prefer `npm ci --ignore-scripts` in CI/Docker, and review `npm audit` findings separately instead of applying forced upgrades during framework migration.
