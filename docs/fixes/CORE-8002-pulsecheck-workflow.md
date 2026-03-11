# CORE-8002: Pulse check popup displayed twice

## issue summary
In a moderated assessment flow (`feedback available` -> mark review as read -> continue), learners could receive the same pulse check popup twice:
1. first popup after feedback/read + review rating flow
2. second popup after navigating to Home

## root cause
`fastFeedbackOpening` was cleared too early in `FastFeedbackService.pullFastFeedback()`.

- the lock was set before opening the modal
- it was reset in `finalize()` right after modal creation/enqueue (not after modal dismissal)
- during this gap, another pulse check check (for example Home `updateDashboard()`) could run and queue/open the same pulse check again

## fix applied
Updated `projects/v3/src/app/services/fast-feedback.service.ts`:
- moved `retry` before `switchMap` so retries only re-run the API fetch, never the modal open
- replaced `catchError` with `finalize` on the modal observable so the lock is released on success, error, and unsubscribe

### operator ordering change

```
before (retry after switchMap — retried modal opens):
  fetch() → switchMap(modal()) → retry(3)

after (retry before switchMap — only retries fetch):
  fetch() → retry(3) → switchMap(modal())
```

`retry` re-subscribes to everything **above** it in the pipe. placing it before `switchMap` means a fetch error retries the fetch, but a modal error passes through without re-triggering the entire pipeline.

## lock state diagram

the `fastFeedbackOpening` storage flag acts as a mutex to prevent concurrent modal opens:

```
         pullFastFeedback() called
                │
                ▼
        ┌───────────────┐
        │ lock = true?  │──── YES ──→ skip modal, return of(res)
        └───────┬───────┘
                │ NO
                ▼
        set lock = TRUE           ← acquire
                │
                ▼
        open modal popup
                │
        ┌───────┴────────┐
        │                │
    success           error/dismiss
        │                │
        ▼                ▼
    finalize()       finalize()    ← both paths release
        │                │
        ▼                ▼
    set lock = FALSE              ← release
```

`finalize` runs when the observable completes, errors, or is unsubscribed — covering all exit paths:
- user submits pulse check → observable completes → lock released
- modal throws error → observable errors → lock released
- user navigates away (component destroyed) → subscription unsubscribed → lock released

## why this is safe
- preserves existing behavior for successful pulse check display
- prevents duplicate modal opens from concurrent trigger paths
- `finalize` guarantees lock release on every exit path — no deadlock possible

## reference trigger paths observed
- review rating close path may request pulse check (`ReviewRatingComponent.fastFeedbackOrRedirect`)
- Home dashboard load also requests pulse check (`HomePage.updateDashboard`)
- assessment submission path (`AssessmentService._afterSubmit`)
- review submission path (`ReviewDesktopPage`)
- manual user click on traffic light (`TrafficLightGroupComponent.navigateToPulseCheck`)

the first two can fire back-to-back in the reported reproduce steps.

## verification checklist
- reproduce original scenario with moderated assessment feedback-read flow
- confirm only one pulse check popup is shown
- confirm pulse check can still be shown later when a genuinely new pulse check is available
