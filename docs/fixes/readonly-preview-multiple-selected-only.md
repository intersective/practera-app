---
status: stable
authority: historical
scope: frontend
last_reviewed: 2026-05-21
supersedes: none
---

# readonly preview: show selected answers only (multiple & oneof)

## rule

in preview and other readonly display-only states (`isDisplayOnly = true`), question components should render only the choice rows that were selected — by the learner, the reviewer, or both. unselected choices must not appear.

## components affected

| component | question type | answer shape |
|---|---|---|
| `app-multiple` | multiple choice (checkboxes) | array of ids |
| `app-oneof` | single choice (radio) | scalar id |

## implementation

### app-multiple (`multiple.component.ts` / `multiple.component.html`)
- `displayChoices` getter collects all selected ids from `submission.answer` (array) and `review.answer` (array) into a `Set`, then filters `question.choices` to matching entries.
- handles stringified and nested answer payloads via `_collectSelectedChoiceIds()`.
- template iterates `displayChoices` instead of `question.choices` inside the `*ngIf="isDisplayOnly"` branch.

### app-oneof (`oneof.component.ts` / `oneof.component.html`)
- `displayChoices` getter adds `submission.answer` and `review.answer` (both scalars) into a `Set`, then filters `question.choices`.
- if the learner and reviewer selected different options, both rows are shown — each with its own "Learner's Answer" / "Reviewer's Answer" chip.
- if they selected the same option, the Set deduplicates it; the single row shows both chips.
- template iterates `displayChoices` instead of `question.choices` inside the `*ngIf="isDisplayOnly"` branch.

## verification

- `projects/v3/src/app/components/multiple/multiple.component.spec.ts` covers the filtered preview list and the rendered template output for the multiple type.