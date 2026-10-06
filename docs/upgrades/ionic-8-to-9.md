# Ionic 8 to 9

This change upgrades `@ionic/angular` and `@ionic/core` from 8.8.1 to 9.0.5 to resolve the button ARIA initialization error. Ionic 9.0.5 replaces the button's ARIA watchers with an attribute controller ([upstream change](https://github.com/ionic-team/ionic-framework/pull/31264)). No local vendor patch or install/build patch hook is required.

The app retains `IonicModule.forRoot()` and NgModules. Ionic imports use `@ionic/angular/lazy`, including test controller overrides, and Vite excludes that entry point from prebundling. The text component reads the typed `ionInput` value from `event.detail.value`. Browser targets reflect Ionic 9's Safari/iOS 16 minimum; Angular's browser requirements also apply.

## Validation

- Real Ionic lazy button regression covers ARIA updates before and after initialization; Safari reproduction reports zero errors with correct accessible state.
- Application/spec type checks, request library, development build and Vite startup pass.
- Full suite: 1,602 passing; the same 32 failing test names as the base (1,600 passing). Baseline defects remain outside this upgrade.
- Production configuration with a temporary local environment fixture fails the same seven budget checks as the untouched base: six component styles and the initial bundle. Initial size changes from approximately 3.98 MB to 4.00 MB. Budgets were not relaxed; deployment environment configuration was not validated.

## Before merge

Complete authenticated smoke testing of home/settings/avatar, file upload, assessment input auto-save and layouts, navigation and overlays. Ionic 9 changes textarea minimum heights in Material Design mode. Keep the separate IonicModule deprecation migration out of this fix.

Existing Docker dependency volumes retain Ionic 8 until refreshed. Validate with the feature source checkout and Linux dependencies installed from its lockfile; the host worktree's macOS packages are unsuitable for the container. The currently running Docker app was not changed by this PR preparation.
