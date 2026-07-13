---
status: stable
authority: canonical
scope: frontend
last_reviewed: 2026-07-13
supersedes: none
---

# Assessment Pagination Feature Toggle

This document explains how to enable/disable the assessment pagination feature using environment flags.

## Configuration

The pagination feature is controlled by the `featureToggles.assessmentPagination` flag in the environment files.

### Environment Files

The feature toggle is configured in the following files:
- `src/environments/environment.ts` (staging/default)
- `src/environments/environment.prod.ts` (production)
- `src/environments/environment.local.ts` (local development)
- `src/environments/environment.custom.ts` (custom environments)

### Flag Configuration

```typescript
export const environment = {
  // ... other environment properties
  featureToggles: {
    assessmentPagination: true,  // Set to false to disable pagination
  },
};
```

## Behavior

### When `assessmentPagination: true` (Default)
- non-Team360 assessment questions are packed into pages of up to 10 questions
- Team360 assessments render each configured group on its own physical page, preserving this order: self-assessment, configured member-review groups, then general groups
- pagination controls (Prev/Next buttons and page indicators) are visible in the bottom action bar
- Team360 assessments are the exception: they show only Prev/Next buttons, with no page numbers, dots, completion icons, or direct page-indicator navigation
- Team360 progress is based on selector-bearing member groups with an actual member selection, with each configured member group on its own page
- the first selector-bearing peer group is mandatory and must be visited with a member selected; later peer groups remain optional workflow pages and cannot satisfy the first-peer requirement
- Team360 navigation includes self-assessment, permitted member-group pages, and selector-free pages after the member section; unused member placeholder pages remain inaccessible
- required questions in trailing selector-free groups are checked assessment-wide and block submission from every page, while optional trailing groups add no submission requirement
- page indicator states depend on the current mode:

  **edit mode** (`doAssessment = true` or `isPendingReview = true`):

  | visited | required complete | indicator |
  |---|---|---|
  | no | any | plain number (neutral) |
  | yes | no | plain number (neutral) |
  | yes | yes | green checkmark |

  **read-only mode** (feedback viewing, completed submission, locked team assessment):
  - all indicators show plain numbers only — completion state is irrelevant when nothing is editable

- when the user clicks Submit and unvisited pages exist, they are submitted directly — no confirmation dialog is shown
- navigating to a new page automatically scrolls the view back to the top of the form (handles both mobile `ion-content` and desktop split-pane `ion-col` scroll containers)
- the submit button is centered directly below the pagination row in the bottom action bar

### When `assessmentPagination: false`
- All assessment questions are displayed on a single page
- No pagination controls are shown
- Traditional single-page assessment experience
- All questions are accessible without navigation

## Technical Implementation

the feature toggle affects:

1. **template rendering** — pagination UI is conditionally rendered based on `isPaginationEnabled`
   - `showPageIndicators` keeps numbered page indicators available for non-Team360 assessments only
2. **question display** — questions are either paginated or shown all at once via `pagedGroups`; Team360 uses one configured group per page while other types use question-count packing
3. **navigation methods** — `prevPage()`, `nextPage()`, `goToPage()` are no-ops when pagination is disabled; each marks the destination page in `pageVisited[]`; Team360 uses `accessiblePageIndexes` so navigation can skip hidden placeholder pages
4. **page completion** — `pageRequiredCompletion[]` tracks whether all required questions on each page are answered; indicators are gated on `pageVisited[]` so unvisited pages always show neutral
5. **Team360 member completion** — selector-bearing groups are mapped to their configured physical pages and count only after the page is visited and a member is selected
6. **submit state** — Team360 submission requires the first member-review section to be complete, the overall assessment form to be valid, and every required question on accessible Team360 pages to be answered

## Usage Examples

### Disable pagination for a specific environment:
```typescript
// environment.local.ts
export const environment = {
  // ... other properties
  featureToggles: {
    assessmentPagination: false,  // Single page mode
  },
};
```

### Enable pagination (default behavior):
```typescript
// environment.prod.ts
export const environment = {
  // ... other properties
  featureToggles: {
    assessmentPagination: true,   // Multi-page mode
  },
};
```

## Testing

To test the feature toggle:

1. Modify the `assessmentPagination` flag in your target environment file
2. Rebuild the application with the appropriate environment configuration
3. Navigate to any assessment
4. Verify the pagination behavior matches the configuration

## Backward Compatibility

The feature toggle defaults to `true` (pagination enabled) if not explicitly set, ensuring backward compatibility with existing deployments.
