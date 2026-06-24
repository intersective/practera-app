# Angular 17 → 18 & Ionic 7 → 8 Upgrade

> **Branch:** `angular-eos-upgrades-prerelease`
> **Date:** March 2026
> **Reason:** Angular 17 and Ionic 7 reached end-of-support

---

## Scope of Changes

169 files changed across framework upgrades, configuration updates, test infrastructure, and source fixes.

### Version Changes

| Package | Before | After |
|---------|--------|-------|
| `@angular/*` | ^17.3.12 | ^18.0.0 |
| `@ionic/angular` | ^7.8.6 | ^8.0.0 |
| `apollo-angular` | ^6.0.0 | ^7.0.2 |
| `ngx-quill` | ^25.3.2 | ^26.0.10 |
| `@angular-devkit/build-angular` | ^17.3.16 | ^18.0.0 |
| `@angular-devkit/architect` | ~0.1703.16 | ~0.1802.0 |
| `@angular-eslint/*` | ~17.5.2 | ~18.4.0 |
| `@ionic/angular-toolkit` | ^9.0.0 | ^11.0.0 |
| `ng-packagr` | ^17.3.0 | ^18.0.0 |
| `zone.js` | ~0.14.3 | ~0.14.8 |
| TypeScript | ~5.4.5 | ~5.4.5 (unchanged) |
| Node | v20.x | v20.x (unchanged) |

### Packages Removed

| Package | Reason |
|---------|--------|
| `@ionic/storage` ^4.0.0 | no longer used in app |
| `angular2-text-mask` ^9.0.0 | replaced with native solution |
| `ng-intercom` ^8.0.2 | intercom integration removed |

### Peer Dependency: ngx-quill

`ngx-quill` v25 declared `@angular/core` ^17 as a peer dependency. upgrading to `ngx-quill` ^26.0.10 was required to resolve the `npm ERESOLVE` conflict against Angular 18.

### Request Library

the `projects/request/package.json` peer dependencies were widened:

```json
// before
"@angular/common": "^13.2.0",
"@angular/core": "^13.2.0"

// after
"@angular/common": "^17.0.0 || ^18.0.0",
"@angular/core": "^17.0.0 || ^18.0.0"
```

---

## Configuration Changes

### angular.json

1. **style order swap** — `global.scss` now loads before `variables.scss` to ensure CSS variable definitions are available when global styles are processed:

```json
// before
[{ "input": "projects/v3/src/theme/variables.scss" },
 { "input": "projects/v3/src/global.scss" }]

// after
[{ "input": "projects/v3/src/global.scss" },
 { "input": "projects/v3/src/theme/variables.scss" }]
```

2. **test builder include** — Angular 18's karma builder requires an explicit include pattern to discover spec files:

```json
"test": {
  "options": {
    "include": ["projects/v3/src/**/*.spec.ts"]
  }
}
```

### tsconfig.app.json

added `src/test.ts` to the exclude array to prevent test infrastructure (jasmine types) from contaminating the application build:

```json
"exclude": [
  "src/test.ts",
  "src/testing/**/*.ts",
  "**/*.spec.ts",
  "src/environments/environment.*.ts"
]
```

### karma.conf.js

| Setting | Before | After | Reason |
|---------|--------|-------|--------|
| `browsers` | `['Chrome']` | `['ChromeHeadless']` | headless CI execution |
| `jasmineOptions.timeoutInterval` | (default) | `10000` | prevent timeout on complex setup |
| `browserNoActivityTimeout` | (default) | `120000` | prevent disconnect during long suites |
| `browserDisconnectTimeout` | (default) | `30000` | tolerate slow test teardown |
| `browserDisconnectTolerance` | (default) | `3` | allow reconnection attempts |
| `jasmineOptions.random` | `false` | `false` | retained for deterministic runs |

---

## Test Infrastructure (test.ts)

### destroyAfterEach

changed from `false` to `true`. Angular 18 defaults to `destroyAfterEach: true`, meaning each test's `TestBed` is torn down after every spec. this surfaces real cleanup issues but requires all components and services to handle destruction gracefully.

```typescript
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  { teardown: { destroyAfterEach: true } }
);
```

### global mock providers

Ionic 8 changed `ModalController` and `PopoverController` from `providedIn: 'root'` to being registered only by `IonicModule.forRoot()`. this means any component injecting these controllers will throw `NullInjectorError` during test teardown if not explicitly provided.

a global `beforeEach` block in `test.ts` provides fallback mocks:

```typescript
beforeEach(() => {
  TestBed.overrideProvider(ModalController, {
    useValue: jasmine.createSpyObj('ModalController', {
      create: Promise.resolve(mockOverlay),
      dismiss: Promise.resolve(),
      getTop: Promise.resolve(null),
    }),
  });
  TestBed.overrideProvider(PopoverController, {
    useValue: jasmine.createSpyObj('PopoverController', {
      create: Promise.resolve(mockOverlay),
      dismiss: Promise.resolve(),
    }),
  });
  TestBed.overrideProvider(AngularDelegate, {
    useValue: jasmine.createSpyObj('AngularDelegate', ['create']),
  });
  TestBed.overrideProvider(Apollo, {
    useValue: jasmine.createSpyObj('Apollo', ['use', 'watchQuery', 'mutate', 'query']),
  });
});
```

specs that need the real service can re-call `TestBed.overrideProvider()` before `compileComponents()`.

### @angular/localize/init

added `import '@angular/localize/init'` at the top of `test.ts` to support `$localize` template literals in test context.

---

## Ionic 8 Behavioral Changes

### ModalController / PopoverController DI

**breaking change:** these overlay controllers are no longer `providedIn: 'root'`. they are registered by `IonicModule.forRoot()` in the app module, but test modules that don't import `IonicModule.forRoot()` will get `NullInjectorError`.

**impact:** every test that creates a component injecting `ModalController` or `PopoverController` either needs explicit providers or relies on the global mock in `test.ts`.

### Checkbox / Radio Label Placement

Ionic 8 requires `labelPlacement="end"` with content inside the component tag instead of separate `ion-label` elements:

```html
<!-- ionic 7 pattern -->
<ion-label [innerHTML]="choice.name"></ion-label>
<ion-checkbox slot="start"></ion-checkbox>

<!-- ionic 8 pattern -->
<ion-checkbox labelPlacement="end" slot="start">
  <span [innerHTML]="choice.name"></span>
</ion-checkbox>
```

affected components: `multiple`, `oneof`, `multi-team-member-selector`, `team-member-selector`.

---

## Source Code Changes

### Circular Dependency Fixes

three circular dependency chains were broken using `forwardRef()` and dynamic imports:

#### 1. FastFeedbackService ↔ NotificationsService

`FastFeedbackService` injects `NotificationsService`, which imports `FastFeedbackComponent`, which injects `FastFeedbackService`.

```typescript
// fast-feedback.service.ts
@Inject(forwardRef(() => NotificationsService)) private notificationsService: any,
```

```typescript
// notifications.service.ts — lazy import instead of top-level
async fastFeedbackModal(props, options) {
  const { FastFeedbackComponent } = await import(
    '../components/fast-feedback/fast-feedback.component'
  );
  // ...
}
```

#### 2. ReviewRatingComponent → FastFeedbackService / NotificationsService

```typescript
// review-rating.component.ts
@Inject(forwardRef(() => FastFeedbackService)) private fastFeedbackService: any,
@Inject(forwardRef(() => NotificationsService)) private notificationsService: any,
```

#### 3. UppyUploaderService ↔ UppyUploaderComponent

```typescript
// uppy-uploader.service.ts — dynamic import instead of top-level
async open(source) {
  const { UppyUploaderComponent } = await import('./uppy-uploader.component');
  // ...
}
```

### Observable Initialization Pattern

Angular 18's stricter initialization order requires service-derived observables to be assigned in the constructor rather than at field declaration. field initializers run before the constructor, so injected services may not be available yet.

```typescript
// before (Angular 17 — worked by coincidence)
export class ActivityDesktopPage {
  assessment = this.assessmentService.assessment$;
}

// after (Angular 18 — explicit constructor assignment)
export class ActivityDesktopPage {
  assessment: Observable<Assessment>;
  constructor(private assessmentService: AssessmentService) {
    this.assessment = this.assessmentService.assessment$;
  }
}
```

affected pages: `ActivityDesktopPage`, `TopicMobilePage`.

### .toPromise() → firstValueFrom() Migration (Partial)

`.toPromise()` is deprecated in RxJS 7 and will be removed in RxJS 8. several call sites were migrated:

```typescript
// before
const activity = await this.getActivityBase(id).pipe(...).toPromise();

// after
const activity = await firstValueFrom(this.getActivityBase(id).pipe(...));
```

**migrated locations:**
- `activity.service.ts` — `goToTask()` assessment/topic fetching
- `activity-desktop.page.ts` — `submitAssessment()`, `fetchAssessment()`, `getTodoItems()`
- `review-desktop.page.ts` — `fetchAssessment()`
- `assessment-mobile.page.ts` — `readFeedback()`

**remaining (22 call sites):** these still use `.toPromise()` and should be migrated in a follow-up:
- `auth-global-login.component.ts`, `auth-direct-login.component.ts`
- `assessment.component.ts`, `activity.component.ts`
- `experience.service.ts`, `pusher.service.ts`, `filestack.service.ts`
- `review-rating.component.ts`, `support-popup.component.ts`
- `ngx-embed-video.service.ts`, `devtool.page.ts`, `experiences.page.ts`

### Null-Safety Fixes

Angular 18's stricter template checking and `destroyAfterEach: true` surfaced several null-safety issues:

| File | Fix |
|------|-----|
| `auth-direct-login.component.ts` | `res.message.includes()` → `res?.message?.includes()` |
| `auth-global-login.component.ts` | same null-safe `_error()` method |
| `chat-preview.component.ts` | `isBrowserSupportedVideo()` now returns `!!()` for boolean |
| `assessment.component.ts` | `this.review?.status` null check |
| `file-upload.component.ts` | `this.control?.setValue()` null checks |
| `multiple.component.ts` | `this.control?.errors` null check |
| `oneof.component.ts` | `this.control?.errors` null check |
| `slider.component.ts` | `this.control?.errors` null check |
| `team-member-selector.component.ts` | `this.control?.disabled`, `submission?.answer` null checks |
| `multi-team-member-selector.component.ts` | `this.control?.disabled`, `submission?.answer` null checks |
| `text.component.ts` | `audienceContainReviewer()` null guard on `question.audience` |

### ImgComponent — Missing OnChanges Interface

`ImgComponent` used `ngOnChanges()` without implementing the `OnChanges` interface. added the interface declaration for Angular 18 strict mode:

```typescript
// before
export class ImgComponent { ... }

// after
export class ImgComponent implements OnChanges { ... }
```

### Assessment Form Validation Rewrite

the `_populateQuestionsForm()` method was rewritten to:

1. **build a new FormGroup before assigning** — avoids `_rawValidators` errors during template rendering with stale `formControlName` bindings
2. **apply validators only when user can edit** — `doAssessment || isPendingReview` check prevents required indicators in read-only mode
3. **use custom validators** for reviewer and file upload fields:
   - `_answerRequiredValidatorForReviewer` — validates `{answer, comment, file}` shape
   - `_fileRequiredValidatorForLearner` — validates file URL presence
4. **initialize form controls with proper types** — review mode uses `{answer, comment, file}` objects; multi-team-member-selector in assessment mode uses plain arrays

### ActivityService goToTask() Overload

`goToTask()` now accepts an optional `activityId` parameter to fix navigation issues where `this.activity` was stale after async operations:

```typescript
// before
async goToTask(task: Task, getData = true)

// after
async goToTask(task: Task, activityIdOrGetData?: number | boolean, getData = true)
```

the method handles backward compatibility by checking the type of the second parameter.

### Assessment Submission Button Guard

a `submitting` flag prevents the submit button from being re-enabled during intermediate fetches after submission:

```typescript
continueToNextTask() {
  case 'submit':
    this.submitting = true;
    this.btnDisabled$.next(true);
    // ...
}
```

the flag is cleared when the submission changes or when the assessment exits editable state.

---

## Testing Mock Updates

### MockRouter

added missing methods required by Angular 18's router:

```typescript
this.getCurrentNavigation = this.spy('getCurrentNavigation').and.returnValue(null);
this.serializeUrl = this.spy('serializeUrl').and.returnValue('/test');
```

### TestUtils (UtilsService mock)

added missing spy methods that Angular 18's stricter initialization calls:

```typescript
this.isMobile = this.spy('isMobile').and.returnValue(false);
this.isQuillContentEmpty = this.spy('isQuillContentEmpty').and.returnValue(false);
this.scrollToElement = this.spy('scrollToElement');
this.isColor = this.spy('isColor').and.returnValue(false);
this.getCurrentLocale = this.spy('getCurrentLocale').and.returnValue('en-US');
this.setPageLanguage = this.spy('setPageLanguage');
this.isHour12Format = this.spy('isHour12Format').and.returnValue(true);
this.setPageTitle = this.spy('setPageTitle');
this.addLanguageAttributes = this.spy('addLanguageAttributes').and.callFake((htmlContent) => htmlContent);
this.moveToNewLocale = this.spy('moveToNewLocale');
this.detectLanguage = this.spy('detectLanguage').and.returnValue(null);
this.decodeHtmlEntities = this.spy('decodeHtmlEntities').and.callFake((text) => text);
this.checkIsPracteraSupportEmail = this.spy('checkIsPracteraSupportEmail').and.returnValue(false);
```

### Test Fixtures

- `tasks.ts` — added `NormalizedActivityFixture` with `unlockConditions` property; reduced task list size
- `programs.ts` — expanded `createExperience()` factory with full `Experience` type
- `chats.ts` — added `mockChatMessages`, `createMessage()`, `createUser()` factories

---

## CI/CD Changes

the GitHub Actions workflow files (`.github/workflows/*.yml`) received two changes per environment:

1. **helpline email** — `programs@practera.com` → `help@practera.com`
2. **assessment pagination toggle** — `CUSTOM_ENABLE_ASSESSMENT_PAGINATION` environment variable added

| Workflow | Pagination Value |
|----------|-----------------|
| `p2-stage-appv3.yml` | `true` |
| `p2-prerelease-appv3.yml` | `true` |
| `p2-aus-appv3.yml` | `false` |
| `p2-euk-appv3.yml` | `false` |
| `p2-usa-appv3.yml` | `false` |

---

## Verification Status

| Check | Status |
|-------|--------|
| `npm install` | pass (no ERESOLVE, no --legacy-peer-deps) |
| `ng build v3 -c development` | pass (CSS budget warnings pre-existing) |
| `ng serve v3` | pass |
| `npm test` | 1263 SUCCESS, 0 FAILED, 13 skipped |
| removed package references | none found (grep verified) |
| deprecated pattern audit | 22 `.toPromise()` remaining (non-blocking) |

---

## Known Follow-Up Items

1. **`.toPromise()` migration** — 22 remaining call sites should be migrated to `firstValueFrom()` before RxJS 8
2. **`emitDecoratorMetadata`** — still `true` in `tsconfig.app.json`; Angular 18 does not require it. removing it reduces bundle metadata but needs testing for DI edge cases
3. **`npm run lint`** — linter should be run and any new Angular 18 lint rules addressed

---

## Related Documentation

- [Assessment Pagination Feature Toggle](../features/assessment-pagination-feature-toggle.md)
- [Slider Rating Implementation](../features/slider-rating-implementation.md)
- [CORE-8002 Pulse Check Workflow Fix](../fixes/CORE-8002-pulsecheck-workflow.md)
- [CORE-8166/8167 Pagination Answer Persistence](../fixes/CORE-8166-8167-pagination-answer-persistence.md)
- [Toggle Label Directive](../directives/toggleLabelDirective.md)
