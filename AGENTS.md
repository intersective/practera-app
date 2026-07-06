# AGENTS.md

## Overview

This is **App V2** — the Practera learner application built with Angular 21 + Ionic 8. It is the primary student-facing experience for experiential learning programs.

## Build & Test

```bash
npm install
npm test                  # Karma/Jasmine unit tests
ng build v3 --configuration production  # production build
ng serve v3 --port 4200   # dev server
```

## Key Rules for AI Agents

- **Angular 21 with control-flow syntax**: use `@if`, `@for`, `@switch` — NOT `*ngIf`, `*ngFor`, `*ngSwitch`.
- **Ionic NgModule approach**: the app uses `IonicModule.forRoot()` — do not switch to standalone components.
- **`prebundle.exclude`** in `angular.json` must NOT be removed — required to prevent Stencil/Ionic 404 errors with Vite.
- **Change detection**: use `NgZone.run(() => { ...; cdr.markForCheck(); })` inside subscription callbacks.
- **Tests**: use `(component as any).property = spy` pattern for Ionic overlay controllers — not `providers: [{provide: ModalController}]`.
- **No secrets in code.** Environment values only via `src/environments/`.

## Safety Rules

- NO secrets or credentials in code.
- Always test after Angular dependency changes — Ionic/Stencil is fragile with Vite bundler.
- `ng serve` must work after any template or module change.
- Do not remove `prebundle.exclude` from `angular.json`.
