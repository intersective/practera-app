# Angular 21 evaluation for `projects/v3`

This note is the planning SSOT for a future Angular 21 upgrade of `projects/v3`. It is intentionally docs-only and does not imply that Angular 21 should be implemented yet.

For the current shipped baseline and the earlier Angular 20 migration constraints, see [Angular 20 baseline and Angular 21 gate](./angular-20-baseline-and-21-gate.md).

## Current baseline

The current working baseline for `projects/v3` and the internal `projects/request` library is:

- Angular runtime packages: `20.3.x`
- Angular CLI/build tooling: `20.3.x`
- Ionic Angular: `8.8.11`
- TypeScript: `5.9.x`
- Zone.js: `0.15.x`
- `@ionic/angular-toolkit`: `12.3.0`
- `@uppy/angular`: `1.1.0`
- `ngx-quill`: `28.0.2`
- `apollo-angular`: `14.1.0`

The repo remains NgModule-based and Zone-based. Do not combine the Angular 21 work with a standalone migration, zoneless migration, or Angular application builder migration.

## Target state

When the upgrade is eventually executed, target this Angular 21 baseline:

- Angular runtime packages: `21.2.x`
- Angular CLI/build tooling: `21.2.x`
- `ng-packagr`: `21.2.x`
- `@angular-eslint/*`: `21.x`
- `ngx-quill`: `30.1.3`
- TypeScript: `5.9.x`
- Node.js: `>=20.19.0`, standardized on `20.20.x` or newer
- Zone.js: prefer keeping `0.15.x` first; move to `0.16.x` only if required by Angular 21 behavior or tooling
- Ionic Angular: keep the newest Angular-21-compatible Ionic 8 release available at implementation time

## Findings and blockers

These findings are based on the current repo state, official Angular/Ionic documentation, and npm package metadata. Context7 MCP was not available in this session.

- `@ionic/angular` itself is not the primary blocker. Ionic 8 supports Angular 16+ and current Ionic package peers do not independently block Angular 21.
- `@uppy/angular@1.1.0` is a real Angular 21 blocker. Its peer dependency support stops at Angular 20, while `v3` still uses its Angular wrapper components.
- `@ionic/angular-toolkit@12.3.0` is a real blocker or risk. Its published dependency alignment is still tied to Angular 20 devkit and schematics packages.
- `ngx-quill`, `apollo-angular`, `ng-packagr`, Angular ESLint, TypeScript, and Zone.js all have viable Angular 21-compatible upgrade paths.

## Decision gates

Do not start implementation until all of these conditions are satisfied:

1. `@ionic/angular-toolkit` is either removed from active developer, CI, generate, and build workflows, or a newer Angular 21-compatible toolkit release exists.
2. `@uppy/angular` is replaced with an internal Angular wrapper over `@uppy/core` and `@uppy/dashboard`.
3. The upgrade path does not depend on forced peer overrides, `--legacy-peer-deps`, or temporary compatibility hacks.

## Planned implementation sequence

When the upgrade is approved for execution, use this order:

1. Audit actual usage of `@ionic/angular-toolkit` across build, generate, CI, Docker, and local developer workflows.
2. Remove the toolkit dependency if it is unused; otherwise keep Angular 21 gated until an Angular 21-compatible toolkit release exists.
3. Replace `@uppy/angular` usage with local Angular wrapper components that preserve current uploader inputs, outputs, modal/dashboard behavior, and Tus upload flow.
4. Run `ng update @angular/core@21 @angular/cli@21`.
5. Align `@angular-devkit/build-angular`, `@angular/compiler-cli`, `ng-packagr`, `@angular-eslint/*`, and `ngx-quill` to their Angular 21-compatible versions.
6. Update `projects/request/package.json` peer dependencies from Angular 20 to Angular 21.
7. Run full lint, build, test, and browser smoke validation before considering the upgrade complete.

## Validation plan

Run these commands after each major implementation stage and again at the final Angular 21 state:

```sh
npm run lint
node_modules/.bin/ng build request --configuration=development
node_modules/.bin/ng build v3 --configuration=development
node_modules/.bin/ng test v3 --no-watch --browsers ChromeHeadless
```

If `projects/v3/src/environments/environment.ts` is missing locally, copy it from `projects/v3/src/environments/environment.local.ts` before running build or test commands.

Required manual smoke tests:

- direct login
- stack selection return flow
- home and tabs navigation
- assessments, including pagination and submission
- chat and Quill editing
- Uppy uploads
- Filestack preview and upload
- topic video and Plyr playback
- settings profile upload
- localized routes and localized builds
- devtool guard behavior

## Defaults and assumptions

- This note is docs-only. No package, code, or config changes are part of this planning pass.
- `./docs/upgrades/` is the canonical location for Angular upgrade notes and findings.
- The preferred future path is to replace `@uppy/angular` rather than wait indefinitely for upstream Angular 21 support.
- If `@ionic/angular-toolkit` is still required by active workflows and cannot be removed cleanly, Angular 21 should remain blocked and the app should stay on Angular 20.
