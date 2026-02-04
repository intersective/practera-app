# Dead Code Audit: NotificationsService and PopUpComponent

## Date: February 4, 2026

## Scope
Audit of unused modal methods and modal types in:
- `projects/v3/src/app/services/notifications.service.ts`
- `projects/v3/src/app/components/pop-up/pop-up.component.html`

## Findings

### Removed in This Session

#### 1. `trackInfo()` Method ✅ REMOVED
- **Location**: `notifications.service.ts` (lines 1055-1064)
- **Purpose**: Display pulse check status information modal
- **Status**: **UNUSED** - superseded by home page local implementation
- **Evidence**:
  - Home page uses local `onTrackInfo()` method instead
  - No references found in codebase (except deleted method)
  - Not in documentation or API contracts
- **Action**: Removed

#### 2. `pulseCheckStatus` Modal Type ✅ REMOVED
- **Location**: `pop-up.component.html` (lines 48-59)
- **Purpose**: Template case for pulse check status info
- **Status**: **UNUSED** - only referenced by deleted `trackInfo()` method
- **Evidence**:
  - Only caller was `trackInfo()` method
  - Home page traffic light display uses different binding (`pulseCheckStatus` data property, not modal type)
  - No other references in codebase
- **Action**: Removed

### Active Modal Methods (All Used)

#### Public Modal Creation Methods
1. **`popUp(type, data, redirect)`** ✅ USED
   - Used by: auth-forgot-password, auth-registration, contact-number-form, home page
   - Creates PopUpComponent modals with types: `forgotPasswordConfirmation`, `shortMessage`, `guidelines`

2. **`achievementPopUp(type, achievement, options)`** ✅ USED
   - Used by: home page, shared service, notifications service (for achievement notifications)
   - Creates AchievementPopUpComponent modals

3. **`lockTeamAssessmentPopUp(data, event)`** ✅ USED
   - Used by: assessment components when user clicks locked team assessment
   - Creates LockTeamAssessmentPopUpComponent modals

4. **`activityCompletePopUp(activityId, activityCompleted)`** ✅ USED
   - Used by: activity service when activity is completed
   - Creates ActivityCompletePopUpComponent modals

5. **`popUpReviewRating(reviewId, redirect, hasReviewRating)`** ✅ USED
   - Used by: activity-desktop, assessment-mobile, devtool pages
   - Creates ReviewRatingComponent modals

6. **`fastFeedbackModal(props, options)`** ✅ USED
   - Used by: fast-feedback service for pulse check
   - Creates FastFeedbackComponent modals

#### Supporting Methods
7. **`modal(component, componentProps, options, event)`** ✅ USED
   - Internal wrapper around modalOnly
   - Used by all modal creation methods

8. **`modalOnly(component, componentProps, options, event)`** ✅ USED
   - Core modal creation with queue management
   - Uses ModalService to handle modal queue

#### Utility Methods
9. **`alert(config)`** ✅ USED
   - Used throughout app for alert dialogs
   - AlertController wrapper

10. **`presentToast(message, options)`** ✅ USED
    - Used throughout app for toast notifications
    - ToastController wrapper

11. **`loading(opts)`** ✅ USED
    - Used for loading spinners
    - LoadingController wrapper

12. **`dismiss()`** ✅ USED
    - Used to dismiss modals
    - ModalController wrapper

### Active PopUpComponent Modal Types (All Used)

1. **`forgotPasswordConfirmation`** ✅ USED
   - Used by: auth-forgot-password component
   - Shows email confirmation message

2. **`shortMessage`** ✅ USED
   - Used by: contact-number-form, auth-registration, home page
   - Generic short message display

3. **`guidelines`** ✅ USED
   - Used by: home page
   - Shows message with clickable route links

## Audit Summary

- **Total methods audited**: 12 public methods + 2 internal helpers
- **Unused methods found**: 1 (`trackInfo()`)
- **Unused modal types found**: 1 (`pulseCheckStatus`)
- **All other methods**: Actively used and verified

## Verification Method

1. Grep search for method names across entire codebase
2. Check documentation files for references
3. Verify template usage in PopUpComponent
4. Cross-reference with home page implementation

## Recommendations

### Immediate Actions ✅ COMPLETED
- Remove `trackInfo()` method from notifications.service.ts
- Remove `pulseCheckStatus` case from pop-up.component.html
- Update notifications.service.spec.ts to remove any tests for `trackInfo()`

### Future Considerations

1. **No additional dead code found**: All other modal methods are actively used
2. **Modal queue pattern is healthy**: ModalService properly manages modal display queue
3. **PopUpComponent types are lean**: Only 3 modal types remain, all in active use

## Testing Impact

### Test Files Affected
- `projects/v3/src/app/services/notifications.service.spec.ts`
  - Remove any tests for `trackInfo()` method if present

### No Tests Expected For
- `pulseCheckStatus` modal type (template-only change)

## Related Documentation

See [review-rating-duplicate-api-fix.md](./review-rating-duplicate-api-fix.md) for context on why this audit was performed.

## Notes

- Home page's local `onTrackInfo()` implementation uses AlertController directly instead of NotificationsService
- This is a better pattern as it keeps the UI logic local to the page component
- No breaking changes expected from removals as code was genuinely unused
