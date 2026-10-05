# Assessment Page (Mobile)

<!-- module: app-v3/pages/assessment-mobile / type: page / status: draft / feature: deliver.submit.shell -->

## Overview

The assessment page allows learners to submit answers to assessment questions. It supports multiple question types (slider, single-choice, multiple-choice, text, file upload, team member selectors). Answers are auto-saved periodically (every 10 seconds) to prevent data loss. A submit guard prevents premature submission. Paginated question navigation is supported for long assessments.

## Acceptance Criteria

- **AC1**: Assessment loads for the learner's current activity and submission context.
- **AC2**: Answers are auto-saved every 10 seconds (SAVE_PROGRESS_TIMEOUT = 10000ms).
- **AC3**: The submit button is disabled (`btnDisabled$`) until required questions are answered.
- **AC4**: Learner is prevented from navigating away with unsaved changes (submit guard).
- **AC5**: File upload questions support TUS-protocol uploads. The Uppy upload area (with its file input) is shown whenever the question has no file, including after the learner removes an attached file.
- **AC6**: Pagination is supported — learners can navigate through question pages.
- **AC7**: Slider rating questions display a visual slider with configurable min/max values.
- **AC8**: The page also handles the review action (action: 'review') for peer/expert reviews.
- **AC9**: On a team assessment file question, the learner can choose an existing team file (`saveSubmissionAnswer` with `filestoreId`) or upload a new one.
- **AC10**: When the assessment has `signOff`, the screen lists every teammate as signed off (name, comment, time) or not yet. The button says "sign off". The first sign-off submits; later teammates can still add a comment while the submission is pending review.

## Scenarios

### Scenario 1: Submit Assessment with Required Questions
**Steps:**
1. Learner opens assessment for their current activity.
2. Answers all required questions (including slider, text, choice).
3. Clicks submit.

**Expected Results:**
- Answers are saved; submission marked as complete.
- Learner is redirected to the activity page.
- Assessment is no longer editable.

### Scenario 2: Auto-Save
**Steps:**
1. Learner begins answering questions.
2. 10 seconds pass without explicit save.

**Expected Results:**
- Answers are automatically saved to the server.
- "Saving..." indicator shown during save, then clears.

### Scenario 3: Submit Guard
**Steps:**
1. Learner has unsaved answers and attempts to navigate away.

**Expected Results:**
- A confirmation dialog is shown.
- If cancelled, learner stays on the assessment page.

### Scenario 4: File Upload Answer
**Steps:**
1. Learner answers a file-upload question by selecting a file.
2. TUS upload proceeds to S3.

**Expected Results:**
- Upload progress shown.
- On completion, file reference stored as the answer.

### Scenario 5: Replace an Attached File
**Steps:**
1. Learner opens an in-progress assessment whose file question already has a file.
2. Clicks Remove file.
3. Selects a new file.

**Expected Results:**
- After removal the upload area appears with a file input.
- The new file uploads over TUS and becomes the answer, so a required file question can be submitted.
