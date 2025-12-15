# Pulse Check Skills Feature

## Overview
The Pulse Check Skills feature displays a list of skills that users can track their progress on through pulse check assessments. This feature is controlled by a backend feature toggle and only displays data after users have completed pulse check assessments.

## Feature Toggle
- **Toggle Name**: `pulseCheckIndicator`
- **Configuration Location**: Backend experience/program configuration
- **Type**: Boolean flag in `featureToggle` object

### Backend Configuration
The feature toggle is fetched via GraphQL in the `experiences` query:

```graphql
query experiences {
  experiences {
    # ... other fields
    featureToggle {
      pulseCheckIndicator
    }
  }
}
```

This configuration is stored in the experience object and cached in browser storage.

## Implementation Details

### Data Flow
1. **Feature Check**: On home page initialization, the app checks if `pulseCheckIndicator` is enabled
   - Retrieved from: `this.storageService.getFeature('pulseCheckIndicator')`
   - Source: `experience.featureToggle.pulseCheckIndicator`

2. **Data Loading**: When enabled, skills are fetched via `homeService.getPulseCheckSkills()`
   - Triggered in: `HomePage.updateDashboard()`
   - GraphQL Query: `pulseCheckSkills` query
   - Condition: Only populates if backend returns skills (`newSkills.length > 0`)

3. **Data Population**:
   ```typescript
   this.homeService.getPulseCheckSkills().pipe(
     takeUntil(this.unsubscribe$),
   ).subscribe((res) => {
     const newSkills = res?.data?.pulseCheckSkills || [];
     if (newSkills.length > 0) {
       this.pulseCheckSkills = newSkills;
     }
   });
   ```

### When Skills Appear
- **Initial State**: `pulseCheckSkills` is an empty array `[]`
- **Population Trigger**: Backend returns skills data (typically after user completes their first pulse check assessment)
- **Refresh Timing**: 
  - On home page load
  - On navigation back to home page
  - When `updateDashboard()` is called (e.g., via `NavigationEnd` events)

## Related Files
- **Component**: `projects/v3/src/app/pages/home/home.page.ts`
- **Service**: `projects/v3/src/app/services/home.service.ts`
- **Type Definition**: `PulseCheckSkill` interface
- **Experience Service**: `projects/v3/src/app/services/experience.service.ts`

## Type Definition
```typescript
interface PulseCheckSkill {
  // specific fields defined in home.service.ts
  // typically includes: id, name, rating, status, etc.
}
```

## Usage in Template
The `pulseCheckSkills` array is available in the home page template and can be used to:
- Display skill cards
- Show progress indicators
- Render traffic light status per skill
- Link to pulse check assessment activities

## Feature Toggle Check
```typescript
// in home.page.ts ngOnInit()
this.pulseCheckIndicatorEnabled = this.storageService.getFeature('pulseCheckIndicator');

// conditional loading
if (this.pulseCheckIndicatorEnabled === true) {
  this.homeService.getPulseCheckStatuses().pipe(...).subscribe(...);
}
```

## Backend Requirements
To enable this feature:
1. Set `featureToggle.pulseCheckIndicator = true` in the experience/program configuration
2. Ensure the GraphQL endpoint supports the `pulseCheckSkills` query
3. Return skill data once user completes pulse check assessments

## Related Features
- **Pulse Check Status**: Traffic light indicators showing project health
- **Pulse Check Assessments**: The assessment activities that populate skill data
- **Global Skills Info**: Information dialog about the traffic light system (see `onTrackInfo()` method)

## Notes
- Skills data is only fetched when the feature is enabled
- Empty array is maintained until backend provides skill data
- Feature gracefully handles disabled state by not making unnecessary API calls
- Related to team pulse check functionality and project progress tracking
