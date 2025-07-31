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
- Assessment questions are split across multiple pages (8 questions per page by default)
- Pagination controls (Previous/Next buttons and page indicators) are visible
- Users can navigate between pages using buttons or clicking page indicators
- Page completion indicators show which pages have unanswered required questions

### When `assessmentPagination: false`
- All assessment questions are displayed on a single page
- No pagination controls are shown
- Traditional single-page assessment experience
- All questions are accessible without navigation

## Technical Implementation

The feature toggle affects:

1. **Template Rendering**: Pagination UI is conditionally rendered based on `isPaginationEnabled`
2. **Question Display**: Questions are either paginated or shown all at once via `pagedGroups` getter
3. **Navigation Methods**: Pagination methods (`prevPage`, `nextPage`, etc.) are safe-guarded
4. **Page Completion**: Completion tracking is only active when pagination is enabled

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
