# Review Page (Mobile)

<!-- module: app-v3/pages/review-mobile / type: page / status: draft / feature: deliver.review.reviewer-queue -->

## Overview

The review page allows assigned reviewers (peers, mentors, coordinators) to submit feedback on a learner's assessment submission. It shows the submission's answers in read-only mode alongside reviewer-specific questions. A separate desktop variant (`review-desktop`) provides the same functionality in a wider layout.

## Acceptance Criteria

- **AC1**: The review page loads the submission's answers and the reviewer's questions for the assessment.
- **AC2**: Submission answers are displayed in read-only mode.
- **AC3**: Reviewer can answer all reviewer-specific questions.
- **AC4**: Reviewer can save progress and submit the review.
- **AC5**: A submitted/acknowledged review shows in read-only mode.
- **AC6**: Desktop variant (review-desktop) displays both submission and review side-by-side.

## Scenarios

### Scenario 1: Submit Review
**Steps:**
1. Reviewer is assigned to a submission and opens the review page.
2. Reads the learner's submission answers.
3. Answers reviewer questions.
4. Submits review.

**Expected Results:**
- Review recorded with reviewer's answers.
- Submission status updates to "Reviewed".
- Reviewer cannot re-submit after submitting.

### Scenario 2: Read-Only View for Submitted Review
**Steps:**
1. Reviewer opens a review they have already submitted.

**Expected Results:**
- All answers displayed in read-only mode.
- No edit controls visible.
