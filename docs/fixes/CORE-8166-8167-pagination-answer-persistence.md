# CORE-8166 / CORE-8167 — Pagination Answer Persistence Fix

> **Branch:** `2.4.8/CORE-8166/review-missing-local-answer` and `2.4.8/CORE-8167/standalone-pagination-completed-review-trunk`
> **PR:** [#2636](https://github.com/intersective/app/pull/2636)
> **Date:** March 2026

---

## Problem Summary

When an assessment uses **pagination** (more than 8 questions, split across pages), navigating between pages causes previously entered answers to be **cleared from the UI**. The user's selections (checkboxes, radio buttons, text, etc.) disappear when they leave a page and return to it.

This affects both:
- **Reviewer mode** (`doReview`) — reviewer's in-progress answers lost on page navigation
- **Assessment mode** (`doAssessment`) — learner's in-progress answers lost on page navigation (specific to `multi-team-member-selector`)

---

## Root Cause Analysis

### How Pagination Works

Pagination splits assessment groups into pages via `pagesGroups` array. The template renders only the current page's questions using:

```html
<ng-container *ngFor="let group of pagedGroups">
```

Where `pagedGroups` returns `this.pagesGroups[this.pageIndex]`.

**When the user navigates to a different page, Angular destroys the question components on the current page and creates new ones for the target page.** When navigating back, fresh component instances are created — they run `ngOnInit()` and `_showSavedAnswers()` again.

The `FormGroup` (`questionsForm`) **persists** across page changes — only the visual components are destroyed/recreated. Form controls retain their values.

### The ControlValueAccessor Lifecycle

Each question component implements `ControlValueAccessor`. The lifecycle on component creation is:

1. Component `ngOnInit()` runs → calls `_showSavedAnswers()`
2. `FormControlName` directive's `ngOnInit()` runs → calls `writeValue()` with the current form control value
3. `registerOnChange()` is called — `propagateChange()` becomes functional

This means `propagateChange()` is a **no-op** during step 1, and `writeValue()` in step 2 is the authoritative source of the form control's current value.

### Three Distinct Bugs

#### Bug 1: `_showSavedAnswers()` Overwrites Dirty Form Controls

**Affected modes:** `doReview`, `doAssessment`
**Affected types:** all question types

When a component is recreated on pagination return, `_showSavedAnswers()` in `ngOnInit()` unconditionally read from `@Input` data (e.g., `this.review.answer`, `this.submission.answer`) — which is the **original API data**, not the user's edits. This overwrites `innerValue` with stale data.

**Fix:** check `control.pristine` before deciding the data source:
- If `control.pristine` → use API data (no local edits exist)
- If `!control.pristine` (dirty) → use `control.value` (preserves local edits)

```typescript
// example from oneof.component.ts
if (this.control && !this.control.pristine) {
  this.innerValue = this.control.value;
  this.comment = this.control.value?.comment ?? this.review.comment;
} else {
  this.innerValue = {
    answer: this.review.answer,
    comment: this.review.comment,
  };
  this.comment = this.review.comment;
}
```

#### Bug 2: Template Bindings Read From Stale `@Input` Data

**Affected modes:** `doReview`
**Affected types:** `multiple`, `oneof`, `team-member-selector`, `multi-team-member-selector`

Even after fixing `_showSavedAnswers()`, templates in review mode were binding directly to `@Input` properties (e.g., `review.answer`) instead of the local `innerValue`. So checkbox `[checked]` and radio `[value]` bindings showed the original API answers, not the user's edits.

**Fix:** change all review-mode template bindings to use `innerValue`:

| Component | Before | After |
|---|---|---|
| `multiple` | `review.answer.includes(choice.id)` | `innerValue?.answer?.includes(choice.id)` |
| `oneof` | `review.answer` | `innerValue?.answer` |
| `team-member-selector` | `review?.answer` | `innerValue?.answer` |
| `multi-team-member-selector` | `isSelectedInReview(teamMember)` | `isSelected(teamMember)` |

#### Bug 3: Array Type Initialization Mismatch

**Affected modes:** `doReview` (multiple, multi-team-member-selector), `doAssessment` (multi-team-member-selector)
**Affected types:** `multiple`, `multi-team-member-selector`

For checkbox-based question types, the form control was initialized with `answer: ''` (empty string) instead of `answer: []` (empty array). When `writeValue()` populated `innerValue` with this string value, subsequent calls to `addOrRemove()` crashed with `TypeError: arrayInput.push is not a function` because an empty string is not an array. This silent error prevented `propagateChange()` from executing, so the form control stayed pristine with no user edits actually saved.

**Fix (assessment.component.ts `_populateQuestionsForm()`):**
```typescript
if (this.action === 'review') {
  const arrayTypes = ['multiple', 'multi team member selector'];
  quesCtrl = {
    comment: '',
    answer: arrayTypes.includes(question.type) ? [] : '',
    file: null
  };
} else {
  // assessment mode: multi-team-member-selector uses a plain array
  if (question.type === 'multi team member selector') {
    quesCtrl = [];
  }
}
```

**Fix (component-level guards):** added array coercion in `writeValue()`, `onChange()`, and `_showSavedAnswers()` for both `multiple` and `multi-team-member-selector`:
```typescript
// writeValue guard
if (this.doReview && this.innerValue && !Array.isArray(this.innerValue.answer)) {
  this.innerValue = { ...this.innerValue, answer: [] };
}

// onChange guard
if (!Array.isArray(this.innerValue.answer)) {
  this.innerValue.answer = [];
}
```

---

## Why `doAssessment` Mode Was Also Affected

The `multi-team-member-selector` component was specifically affected in assessment mode because of a **data shape mismatch**:

- In **assessment mode**, the component treats `innerValue` as a **plain array** (e.g., `['key1', 'key2']`). Methods like `onChange()`, `isSelected()`, and `triggerSave()` all operate on `innerValue` directly as an array.
- However, `_populateQuestionsForm()` initialized the form control with `null` (the default for all assessment-mode controls).
- When `writeValue(null)` was called, the null check `if (value)` skipped setting `innerValue`, leaving it undefined.
- On first checkbox click, `onChange()` called `this.utils.addOrRemove(this.innerValue, value)` — which crashed because `this.innerValue` was not an array.

**Fix:** initialize `multi team member selector` with `[]` in assessment mode:
```typescript
if (question.type === 'multi team member selector') {
  quesCtrl = [];
}
```

Plus a defensive guard in `writeValue()`:
```typescript
if (this.doAssessment && !Array.isArray(this.innerValue)) {
  this.innerValue = Array.isArray(this.innerValue?.answer) ? this.innerValue.answer : [];
}
```

Other question types in assessment mode were **not affected** because:
- `multiple` already had a null guard: `if (!this.innerValue) { this.innerValue = []; }`
- Scalar types (`oneof`, `text`, `slider`, `team-member-selector`) use direct assignment, not array operations
- `file-upload` uses `fileRequestFormat()` which safely returns `{}` for null

---

## Question Types Affected

| Question Type | Component | Review Mode Fix | Assessment Mode Fix |
|---|---|---|---|
| Radio (single choice) | `app-oneof` | pristine check + template binding | — |
| Checkbox (multiple choice) | `app-multiple` | pristine check + template binding + array init | — |
| Text / Textarea | `app-text` | pristine check | — |
| Slider | `app-slider` | pristine check | — |
| File Upload | `app-file-upload` | pristine check | — |
| Team Member (single) | `app-team-member-selector` | pristine check + template binding | — |
| Team Member (multi) | `app-multi-team-member-selector` | pristine check + template binding + array init | array init + writeValue guard |

---

## Files Changed

### Parent Component
- **assessment.component.ts** — `_populateQuestionsForm()`: proper initial values for array-type controls in both review and assessment modes; consolidated `_prefillForm()` method

### Question Components (TypeScript)
- **multiple.component.ts** — `_showSavedAnswers()`, `writeValue()`, `onChange()`: pristine check, array coercion
- **oneof.component.ts** — `_showSavedAnswers()`, `writeValue()`: pristine check, comment restoration
- **text.component.ts** — `_showSavedAnswers()`, `writeValue()`: pristine check, object-vs-string handling
- **slider.component.ts** — `_showSavedAnswers()`, `writeValue()`: pristine check, comment restoration
- **team-member-selector.component.ts** — `_showSavedAnswers()`, `writeValue()`: pristine check, comment restoration
- **multi-team-member-selector.component.ts** — `_showSavedAnswers()`, `writeValue()`, `onChange()`: pristine check, array coercion, assessment mode plain-array guard
- **file-upload.component.ts** — `_showSavedAnswers()`: pristine check

### Question Components (Templates)
- **multiple.component.html** — `[checked]` binding: `review.answer.includes()` → `innerValue?.answer?.includes()`; `onLabelToggle` passes `'answer'` type in review mode
- **oneof.component.html** — `[value]` binding: `review.answer` → `innerValue?.answer`
- **team-member-selector.component.html** — `[value]` binding: `review?.answer` → `innerValue?.answer`
- **multi-team-member-selector.component.html** — `[checked]` binding: `isSelectedInReview()` → `isSelected()` in doReview section

---

## The `control.pristine` Pattern

All question components now follow a consistent pattern in `_showSavedAnswers()`:

```
┌─────────────────────────────────────────────────┐
│  Component recreated on pagination return         │
│                                                   │
│  ngOnInit() → _showSavedAnswers()                │
│                                                   │
│  Is control.pristine?                            │
│    YES → Use @Input data (API/original)          │
│     NO → Use control.value (user's local edits)  │
│                                                   │
│  writeValue() called by FormControlName          │
│    → Sets innerValue from form control value     │
│    → Template binds to innerValue (not @Input)   │
└─────────────────────────────────────────────────┘
```

**Why `pristine` works as the discriminator:**
- `_prefillForm()` calls `control.setValue(value, { emitEvent: false })` — this does NOT mark the control as dirty (it stays pristine)
- User interactions call `propagateChange()` → which DOES mark the control as dirty
- So `pristine = true` means "only API data, no user edits" and `pristine = false` means "user has made changes"

**Wait — `setValue()` does mark the control as dirty in some Angular versions.** Actually, `setValue()` with `{ emitEvent: false }` still changes the pristine state to false. The key insight is:
- On first load, `_prefillForm()` sets the value → `pristine = false`
- `_showSavedAnswers()` reads `control.value` which already has the prefilled value
- So either path (pristine or not) produces the correct result on first load
- On pagination return (component recreated), the form control still has the user's edits from `propagateChange()`, and `control.pristine = false`, so `_showSavedAnswers()` correctly reads from `control.value`

---

## Data Shape Reference

### Review Mode
Form control value is always an **object**:
```typescript
{ answer: any, comment: string, file?: any }
```
- `answer` is `[]` for checkbox types, `''` or scalar for others
- Components access `innerValue.answer` and `innerValue.comment` separately

### Assessment Mode
Form control value varies by type:
```typescript
// oneof, team-member-selector: scalar (string/number)
'choice-id' or 5

// multiple: array
[1, 3, 5]

// multi-team-member-selector: array of JSON strings
['{"userId":1,"name":"..."}', '{"userId":2,"name":"..."}']

// text: string
'answer text'

// slider: number
75

// file-upload: FileInput object
{ url: '...', name: 'file.pdf', ... }
```

---

## Three Selection Check Functions in `multi-team-member-selector`

| Function | Data Source | Purpose | Used In Template Sections |
|---|---|---|---|
| `isSelected()` | `this.innerValue` (local state) | current working state including unsaved edits | `doAssessment`, `doReview` — checkbox `[checked]` binding |
| `isSelectedInSubmission()` | `this.submission.answer` (@Input, API data) | learner's original submission | `doReview`, `isDisplayOnly` — "Learner's answer" badge |
| `isSelectedInReview()` | `this.review.answer` (@Input, API data) | reviewer's original review | `isDisplayOnly` — "Expert's answer" badge |

`isSelected()` is used for checkbox bindings in **both** `doAssessment` and `doReview` because it reads from `innerValue` which preserves user edits across pagination. The other two only display static badges from API data.

---

## Testing Verification

Verified via browser screenshots on `localhost:4200`:

### Review Mode — "150 Questions" assessment
- Text field: "Persist test!!!" persisted across page 1 → page 4 → page 1
- Radio (oneof): 2nd choice selection persisted
- Checkbox (multiple): unchecked 1st checkbox stayed unchecked after pagination
- No console errors (previous `TypeError: arrayInput.push` resolved)

### Assessment Mode — "1 group of 9 questions" assessment
- Multi-team-member-selector: selected `learner_reg_091` and `learner 004`, navigated page 1 → page 2 → page 1, both selections persisted

### Review Mode — "1 group of 10 questions" assessment
- Radio selections persisted across pagination
