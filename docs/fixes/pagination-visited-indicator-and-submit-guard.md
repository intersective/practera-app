---
status: stable
author: canonical
scope: frontend
last_reviewed: 2026-05-05
supersedes: none
---

> **2026-05-05 addendum** — follow-up refinements applied after initial merge; see [§ follow-up changes](#follow-up-changes-2026-05-05) below.

# pagination: visited-indicator state model + unvisited-pages submit guard

## problems addressed

### 1 — optional-only pages showed misleading red indicators on load

in team 360 assessments each question group (page) typically contains a `team-member-selector` question plus follow-up rating/text questions. the first N pages are required; additional pages are optional (extra team members).

`areAllRequiredQuestionsAnswered()` returns `true` vacuously when a page contains no required questions, so optional pages were always marked complete and showed a green checkmark immediately. conversely, required pages loaded red before the user had a chance to fill them in, causing confusion.

the red indicator was removed entirely. the root cause was addressed by gating all indicators on whether the user has actually visited a page.

### 2 — learner could accidentally submit before visiting optional pages

once required questions on the first N pages were answered, `questionsForm.valid` became `true` and the submit button enabled. a learner could submit without ever seeing the optional pages, silently skipping feedback for additional team members.

## solution

### pageVisited state model

**`projects/v3/src/app/components/assessment/assessment.component.ts`**

new property added alongside `pageRequiredCompletion`:

```typescript
pageVisited: boolean[] = []; // tracks which pages the user has navigated to
```

| `pageVisited[i]` | `pageRequiredCompletion[i]` | indicator shown |
|---|---|---|
| `false` | any | plain number (neutral) |
| `true` | `true` | green checkmark |
| `true` | `false` | plain number (neutral; required still tracked for submit guard) |

initialisation rules (inside `initializePageCompletion()`):
- called once per assessment load; only creates the array if it is empty
- page 0 is pre-marked visited (always the landing page)
- in read-only mode all pages are marked visited (all show green)
- `pageVisited` is reset to `[]` in `ngOnChanges` when `assessment`, `submission`, or `review` changes

navigation methods each mark the destination:
```typescript
prevPage()        → this.pageVisited[this.pageIndex] = true
nextPage()        → this.pageVisited[this.pageIndex] = true
goToPage(i)       → this.pageVisited[i] = true
```

template changes (`assessment.component.html`) — both pagination blocks updated:
```html
<!-- only show green checkmark when page has been visited and all required questions answered -->
[class.completed]="pageVisited[page] && pageRequiredCompletion[page]"

<ion-icon *ngIf="pageVisited[page] && pageRequiredCompletion[page]" name="checkmark-circle" ...>
```

no scss changes needed; the base `.page-indicator` style (neutral grey) already provides the unvisited/incomplete appearance.

### unvisited-pages submit guard

> **Removed 2026-05-06** — the guard and its confirmation popup were removed. `continueToNextTask()` is now synchronous and calls `_doSubmit()` directly without checking `pageVisited`. `AlertController` was also removed from the component's constructor and import. See [§ follow-up changes](#follow-up-changes-2026-05-06) for detail.
```typescript
private _doSubmit() {
  this.submitting = true;
  this.btnDisabled$.next(true);
  this.submitActions.next({ autoSave: false, goBack: false });
}
```

`AlertController` was added to the constructor injection alongside the existing `ModalController`.

the guard is generic — it fires for any multi-page assessment with unvisited pages, not only team 360. when all pages have been visited there is zero added friction.

## files changed

| file | change |
|---|---|
| `projects/v3/src/app/components/assessment/assessment.component.ts` | `pageVisited` property; `prevPage`/`nextPage`/`goToPage` mark visited; `initializePageCompletion` initialises + preserves visited; `AlertController` import + injection; `continueToNextTask` async with guard; `_doSubmit()`; `_confirmSubmitWithUnvisitedPages()` |
| `projects/v3/src/app/components/assessment/assessment.component.html` | both pagination blocks: `[class.completed]` gated on `pageVisited`; green checkmark `*ngIf` only; red icon removed |
| `projects/v3/src/app/components/assessment/assessment.component.scss` | removed `.page-indicator.incompleted`, `.page-indicator.incompleted .page-number`, `.page-indicator.incompleted .progress-ring-fill`, `.completion-icon:not(.completed)` |
| `projects/v3/src/app/components/assessment/assessment.component.spec.ts` | `AlertController` spy + provider; all `continueToNextTask` call sites made `async`; four new guard tests; two new `initializePageCompletion` tests; two new `prevPage`/`nextPage` visited tests; one new `goToPage` visited test |

## tests added

```
continueToNextTask() unvisited-pages guard
  ✓ submits directly when all pages are visited
  ✓ shows alert and submits when user confirms "Submit anyway"
  ✓ cancels and navigates when user clicks "Review pages"
  ✓ does not show alert when pagination is disabled

initializePageCompletion()
  ✓ marks all pages visited in read-only mode
  ✓ marks only page 0 visited on first call in edit mode
  ✓ preserves existing pageVisited state across re-runs

prevPage() / nextPage()
  ✓ marks destination page as visited

goToPage()
  ✓ marks target page as visited
```

## rationale for removing the red indicator

the non-tech team requested removing red entirely. this was accepted because:
- the visited gate already prevents false-positive red on optional pages
- showing red on visited + required-incomplete pages adds friction before the user has finished filling in the page; it is confusing rather than helpful
- the submit guard (`_confirmSubmitWithUnvisitedPages`) catches the case where a learner tries to submit early, making the red indicator redundant as a warning mechanism
- `pageRequiredCompletion` is still tracked internally and still drives the submit guard — only the visual representation changed

## follow-up changes (2026-05-06)

### 4 — unvisited-pages submit guard removed

**decision:** the confirmation popup ("You have not visited page(s) X. Submit anyway?") was removed entirely. `continueToNextTask()` reverted to synchronous and calls `_doSubmit()` directly. `AlertController` was removed from imports and the constructor.

**rationale:** the submit button is now visually positioned below the pagination row, centered, giving the user a natural visual cue to review each page before submitting. the interrupt dialog added friction without adding value.

**files changed:**

| file | change |
|---|---|
| `projects/v3/src/app/components/assessment/assessment.component.ts` | `continueToNextTask()` made synchronous; unvisited-pages guard removed; `_confirmSubmitWithUnvisitedPages()` deleted; `AlertController` removed from import + constructor |
| `projects/v3/src/app/components/assessment/assessment.component.spec.ts` | `AlertController` import, provider, spy, and full `continueToNextTask() unvisited-pages guard` describe block removed |

### 5 — submit button moved below pagination, centered

**decision:** the submit button is now stacked below the pagination row in the bottom action bar, centered, instead of sitting to the right of the indicators.

**implementation:** added `.stacked` modifier class to `.action-container` in `bottom-action-bar.component.html` (applied when `hasCustomContent` is true). `.action-container.stacked` uses `flex-direction: column; align-items: center`. `.button-container.with-custom-content` `justify-content` changed from `flex-end` to `center`.

**files changed:**

| file | change |
|---|---|
| `projects/v3/src/app/components/bottom-action-bar/bottom-action-bar.component.html` | `[class.stacked]="hasCustomContent"` added to `.action-container` |
| `projects/v3/src/app/components/bottom-action-bar/bottom-action-bar.component.scss` | `.action-container.stacked` — column layout, centered; `.button-container.with-custom-content` `justify-content: center` |

---

## follow-up changes (2026-05-05)

### 1 — read-only mode: indicators hidden entirely

**problem:** in read-only mode (feedback-viewing, completed submissions, locked team assessments) `initializePageCompletion()` marks all pages visited with all completion flags `true`, which caused every page indicator to show a green checkmark. this is meaningless — the user is not filling in anything — and clutters the UI.

**decision:** completion indicators (`.completed` css class + `checkmark-circle` icon) are now gated on `(doAssessment || isPendingReview)` in addition to the existing visited/completion flags. in every read-only scenario both flags are `false`, so indicators are suppressed.

state table (updated):

| `doAssessment \|\| isPendingReview` | `pageVisited[i]` | `pageRequiredCompletion[i]` | indicator shown |
|---|---|---|---|
| `false` (read-only) | any | any | plain number only |
| `true` | `false` | any | plain number only |
| `true` | `true` | `true` | green checkmark |
| `true` | `true` | `false` | plain number only |

**files changed:**

| file | change |
|---|---|
| `projects/v3/src/app/components/assessment/assessment.component.html` | both pagination blocks: `[class.completed]` and `*ngIf` on checkmark icon now also check `(doAssessment \|\| isPendingReview)` |

### 2 — scroll reset on page navigation

**problem:** navigating between pages of different lengths left the scroll position anchored at the bottom, stranding the user mid-page on the new content.

**decision:** a `_scrollToTop()` method was added and called inside `goToPage()`. it handles two scroll environments:

| environment | scroll mechanism |
|---|---|
| mobile (`ion-content`) | `ion-content.scrollToTop(0)` via Ionic's native API |
| desktop (split-pane `ion-col.border-left`) | `app-assessment .main-content scrollIntoView({ block: 'start' })` |

the method prefers the mobile path (returns early on success) so both environments are covered without conflict.

```typescript
private _scrollToTop() {
  setTimeout(() => {
    const content = document.querySelector(
      'ion-router-outlet .ion-page:not(.ion-page-hidden) ion-content'
    ) || document.querySelector('ion-content');
    if (content && typeof (content as any).scrollToTop === 'function') {
      (content as any).scrollToTop(0);
      return;
    }
    const mainContent =
      document.querySelector('app-assessment .main-content') ||
      document.querySelector('app-assessment');
    if (mainContent) {
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 10);
}
```

**files changed:**

| file | change |
|---|---|
| `projects/v3/src/app/components/assessment/assessment.component.ts` | `_scrollToTop()` private method added; called inside `goToPage()` |

### 3 — pagination layout: reverted to bottom action bar

**context:** pagination was temporarily moved into the scrollable `.main-content` body to explore an alternative layout. user feedback indicated this worsened the UX because the controls appeared inconsistently depending on page length and scroll position.

**decision:** reverted. pagination lives back inside `<app-bottom-action-bar>` with `[hasCustomContent]="isPaginationEnabled && pageCount > 1"`. the `standalone-pagination-footer` `<ion-footer>` is also restored for completed reviews where the standard action bar is hidden.

**files changed:**

| file | change |
|---|---|
| `projects/v3/src/app/components/assessment/assessment.component.html` | pagination `<div>` moved back inside `<app-bottom-action-bar>`; `[hasCustomContent]` re-added; `standalone-pagination-footer` `<ion-footer>` restored |
| `projects/v3/src/app/components/assessment/assessment.component.scss` | `.standalone-pagination-footer` styles restored |
