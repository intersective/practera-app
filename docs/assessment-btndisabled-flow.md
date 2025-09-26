═══════════════════════════════════════════════════════════════════════════════════════
                        btnDisabled$ BehaviorSubject Flow Diagram
═══════════════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────┐
│   activity-desktop.page.ts          │
│   (Parent Component)                 │
└─────────────────────────────────────┘
           │
           │ Creates & Passes btnDisabled$
           │ as @Input to assessment.component
           ▼
┌─────────────────────────────────────┐
│   assessment.component.ts            │
│   (Child Component)                  │
│                                      │
│   @Input() btnDisabled$:            │
│   BehaviorSubject<boolean>          │
└─────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════
                    TRIGGER POINTS IN assessment.component.ts
═══════════════════════════════════════════════════════════════════════════════════════

1. ngOnChanges() - Component Lifecycle
   └── btnDisabled$.next(false) ──────────► RESET on assessment change

2. _populateQuestionsForm() - Form Setup
   ├── If no questions exist:
   │   └── btnDisabled$.next(true) ───────► DISABLE (empty form)
   │
   └── questionsForm.valueChanges.subscribe()
       └── setSubmissionDisabled() ───────► CHECK & UPDATE based on validation

3. _handleSubmissionData() - Submission State Handler
   └── If submission.isLocked:
       └── btnDisabled$.next(true) ───────► DISABLE (locked by another user)

4. _handleReviewData() - Review State Handler
   └── If isPendingReview && review.status === 'in progress':
       └── btnDisabled$.next(false) ──────► ENABLE for review

5. continueToNextTask() - Submit Action
   └── If _btnAction === 'submit':
       └── btnDisabled$.next(true) ───────► DISABLE during submission

6. _submitAnswer() - Answer Submission
   └── If required questions missing:
       └── btnDisabled$.next(false) ──────► RE-ENABLE after validation fail

7. resubmit() - Resubmission Flow
   ├── Start: btnDisabled$.next(true) ────► DISABLE during resubmit
   └── End: btnDisabled$.next(false) ─────► RE-ENABLE after completion

8. setSubmissionDisabled() - Main Validation Logic
   ├── Only runs if (doAssessment || isPendingReview)
   ├── If form invalid & not disabled:
   │   └── btnDisabled$.next(true) ───────► DISABLE
   └── If form valid & disabled:
       └── btnDisabled$.next(false) ──────► ENABLE

9. _prefillForm() - Form Population
   ├── After populating form with answers
   ├── questionsForm.updateValueAndValidity()
   └── If edit mode (doAssessment || isPendingReview):
       └── setSubmissionDisabled() ───────► CHECK & UPDATE validation
   └── If read-only mode:
       └── btnDisabled$.next(false) ──────► ENSURE enabled

10. Page Navigation Methods
    ├── goToPage()
    ├── nextPage()
    └── prevPage()
        └── setSubmissionDisabled() ──────► CHECK & UPDATE for new page

═══════════════════════════════════════════════════════════════════════════════════════
                        TRIGGER CONDITIONS SUMMARY
═══════════════════════════════════════════════════════════════════════════════════════

DISABLE CONDITIONS (btnDisabled$.next(true)):
├── No questions in assessment
├── Assessment is locked by another user
├── Form is invalid (required fields empty)
├── During submission process
└── During resubmit process

ENABLE CONDITIONS (btnDisabled$.next(false)):
├── Assessment changes (reset)
├── Form becomes valid
├── Review in progress
├── After failed validation alert
├── After resubmit completion
└── Read-only mode (not doAssessment && not isPendingReview)

═══════════════════════════════════════════════════════════════════════════════════════
                           PROBLEM SCENARIO
═══════════════════════════════════════════════════════════════════════════════════════

User Flow - Original Issue (RESOLVED):
1. User visits Assessment A (has required fields)
   └── Form invalid → btnDisabled$.next(true) ✓

2. User navigates to Assessment B via activity-desktop
   └── ngOnChanges() → btnDisabled$.next(false) ✓
   └── _populateQuestionsForm() → questionsForm created
   └── _populateFormWithAnswers() → form populated
   └── setSubmissionDisabled() → checks validation
       └── BUT: Timing issue - form may not be fully populated
           └── Result: btnDisabled$ may remain false even if invalid

3. RESOLVED: State synchronization fixed
   └── _prefillForm() now properly checks validation after form population

═══════════════════════════════════════════════════════════════════════════════════════
                        SOLUTION IMPLEMENTATION (COMPLETED)
═══════════════════════════════════════════════════════════════════════════════════════

IMPLEMENTED FIXES:
1. ✅ Reset state in ngOnChanges when assessment changes
   └── btnDisabled$.next(false) in ngOnChanges()

2. ✅ Proper validation after form population in _prefillForm()
   ├── questionsForm.updateValueAndValidity()
   ├── Edit mode: setSubmissionDisabled() checks validation
   └── Read-only mode: btnDisabled$.next(false) ensures enabled

3. ✅ Check validation when changing pages
   ├── prevPage() → setSubmissionDisabled()
   ├── nextPage() → setSubmissionDisabled()
   └── goToPage() → setSubmissionDisabled()

4. ✅ Apply validation rules only when in edit mode
   └── setSubmissionDisabled() has guard: (!doAssessment && !isPendingReview)

5. ✅ Replaced _populateFormWithAnswers() with _prefillForm()
   └── Better state management and validation synchronization

RESULT: btnDisabled$ now accurately reflects form state at all times
═══════════════════════════════════════════════════════════════════════════════════════

═══════════════════════════════════════════════════════════════════════════════════════
                                KEY LEARNINGS
═══════════════════════════════════════════════════════════════════════════════════════

1. BEHAVIORSUBJECT STATE PERSISTENCE
   └── BehaviorSubject remembers last value across component input changes
   └── Must explicitly reset when navigating between assessments

2. FORM VALIDATION TIMING
   └── Validation must happen AFTER form population is complete
   └── updateValueAndValidity() is crucial for proper validation state

3. SEPARATION OF CONCERNS
   └── setSubmissionDisabled() handles validation-based enabling/disabling
   └── _prefillForm() handles initial state setup after population
   └── Each method has clear responsibility boundaries

4. EDIT VS READ-ONLY MODES
   └── Only apply validation rules when user can edit
   └── Read-only mode should always have enabled button for navigation
   └── Guard clauses prevent unnecessary state changes

═══════════════════════════════════════════════════════════════════════════════════════