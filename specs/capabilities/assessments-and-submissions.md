---
id: assessments-and-submissions
kind: capability
title: "Assessments & Submissions"
parent: system
value: "Enables learners to complete and submit diverse assessment types (text, multiple-choice, file upload, H5P, SCORM) and receive feedback, demonstrating their competency and progress."
status: active
sources:
  - "projects/v3/src/app/pages/assessment-mobile/**"
  - "projects/v3/src/app/components/assessment/**"
  - "projects/v3/src/app/components/multiple/**"
  - "projects/v3/src/app/components/oneof/**"
  - "projects/v3/src/app/components/slider/**"
  - "projects/v3/src/app/components/text/**"
  - "projects/v3/src/app/components/file-upload/**"
  - "projects/v3/src/app/components/file-display/**"
  - "projects/v3/src/app/components/h5p-player/**"
  - "projects/v3/src/app/services/assessment.service.ts"
tests:
  - "projects/v3/src/app/pages/assessment-mobile/**/*.spec.ts"
  - "projects/v3/src/app/components/assessment/**/*.spec.ts"
  - "projects/v3/src/app/components/multiple/**/*.spec.ts"
  - "projects/v3/src/app/components/oneof/**/*.spec.ts"
  - "projects/v3/src/app/components/slider/**/*.spec.ts"
  - "projects/v3/src/app/components/text/**/*.spec.ts"
  - "projects/v3/src/app/components/file-upload/**/*.spec.ts"
  - "projects/v3/src/app/components/file-display/**/*.spec.ts"
  - "projects/v3/src/app/components/h5p-player/**/*.spec.ts"
  - "projects/v3/src/app/services/assessment.service.spec.ts"
---

# Assessments & Submissions

## Problem & Value

Learners need structured ways to demonstrate competency and receive feedback on their progress. Without a robust assessment system, educators cannot measure understanding, learners lack clear milestones, and experiential programs lose credibility. This capability enables learners to complete diverse assessment formats—from simple multiple-choice questions to complex simulations—submit work for review, and receive feedback that guides improvement. Auto-save prevents data loss during mobile usage, file upload supports portfolio work, and team sign-off facilitates collaborative accountability. By supporting H5P interactive content and SCORM packages, the system accommodates rich learning experiences while capturing xAPI statements that feed skill verification and learning analytics.

## Users & Journeys

- As a learner, I navigate to an assessment task, answer questions across multiple pages, and the system auto-saves my progress every 10 seconds so I never lose work if my connection drops.
- As a team member, I complete my portion of a team assessment, choose to reuse an existing team file or upload a new one, then sign off with a comment so my teammates know I've finished.
- As a learner, I interact with an embedded H5P simulation that posts xAPI statements, and when I complete it the system records my progress and updates my skill passport.
- As a peer reviewer, I open a submitted assessment for review, provide ratings and comments on each question, and submit my review so the learner receives feedback.
- As a learner, I attempt to navigate away from an assessment with unsaved changes and the system warns me, preventing accidental loss of my answers.
- As a learner, I finish answering all required questions, the submit button becomes enabled, and I submit my work to receive feedback and advance in my program.

## Requirements

- [ ] The assessment page loads the specified assessment by assessmentId, activityId, contextId, and optional submissionId, displaying questions and any existing submission data for the learner's current activity context. <!-- claim: assessment-loads-for-context -->
- [ ] Answers are automatically saved every 10 seconds (SAVE_PROGRESS_TIMEOUT = 10000ms) to prevent data loss, with a "Saving..." indicator followed by a timestamp of the last save. <!-- claim: auto-save-every-ten-seconds -->
- [ ] The submit button remains disabled until all required questions have been answered, enforced by the btnDisabled$ observable. <!-- claim: submit-disabled-until-required-answered -->
- [ ] A navigation guard (SinglePageDeactivateGuard) prevents the learner from leaving the assessment page when unsaved changes exist, prompting confirmation to avoid accidental data loss. <!-- claim: navigation-guard-prevents-data-loss -->
- [ ] File upload questions use the TUS protocol via Uppy, displaying the upload area whenever no file is attached, including after a learner removes a previously attached file. <!-- claim: file-upload-supports-tus-protocol -->
- [ ] Assessments support pagination, allowing learners to navigate through multiple pages of questions for long assessments. <!-- claim: paginated-question-navigation -->
- [ ] Slider rating questions display a visual slider control with configurable minimum and maximum values for numeric responses. <!-- claim: slider-rating-questions -->
- [ ] On team assessment file questions, learners can choose an existing team file by filestoreId or upload a new file, recorded via saveSubmissionAnswer. <!-- claim: team-file-selection-or-upload -->
- [ ] When an assessment has signOff enabled, the page lists each teammate as signed off (with name, comment, timestamp) or not yet signed off, the submit button reads "sign off", the first sign-off submits the team submission, and subsequent teammates can add comments while the submission is pending review. <!-- claim: team-sign-off-workflow -->
- [ ] Submitting an assessment in 'in progress' status calls submitAssessment with submissionId, assessmentId, contextId, and answers, returning success true or throwing an error; duplicate submissions are detected and toasted accordingly. <!-- claim: submission-creates-or-updates-answers -->
- [ ] When action is 'review' and submission status is 'pending review', submitting calls submitReview with assessmentId, reviewId, submissionId, and answers, returning success true or throwing an error, then refreshes the reviews list. <!-- claim: review-submission-workflow -->
- [ ] Marking feedback as read via readFeedback saves the reviewed status, refreshes activity tasks and notifications, prompts the learner for review rating if enabled (hasReviewRating and user.hasReviewRating), then navigates to the next task. <!-- claim: feedback-read-and-review-rating -->
- [ ] The H5P player component loads an H5P package using h5p-standalone with the package's content URL, frame script, frame stylesheet, and libraries URL. <!-- claim: h5p-player-loads-package -->
- [ ] xAPI statements posted by the H5P player are forwarded for storage, and a completed or answered statement fires the h5pTaskCompleted event to notify the page. <!-- claim: h5p-xapi-forwarding -->
- [ ] Simulation players (H5P, SCORM, cmi5) post initialized, interacted, completed, and terminated xAPI statements that are forwarded to the LRS with skill IRIs attached from alignments. <!-- claim: simulation-xapi-lifecycle -->
- [ ] Pulse-check assessments include legacy skill sliders 20–25 when requested by the assessment configuration. <!-- claim: pulse-check-legacy-skill-sliders -->
- [ ] After a non-auto-save submission of a pulse-check assessment (pulseCheck true), the system pulls fast feedback data to update the learner's skill passport. <!-- claim: post-submission-fast-feedback -->
- [ ] Assessments of type 'timesheet' or tasks with assessmentType 'timesheet' render the time-log component instead of the standard assessment component. <!-- claim: timesheet-assessment-routing -->
- [ ] When singlePageAccess storage flag is set, the header hides back button and personalised header, restricting navigation for embedded or restricted access contexts. <!-- claim: restricted-single-page-access -->
- [ ] Assessments opened from the events page (from: 'events') skip the deactivation guard and handle navigation context differently, returning to home if no activityId is provided. <!-- claim: event-referral-navigation -->

## Scenarios

### Scenario 1: Submit assessment with all required questions answered
**Steps:**
1. Learner navigates to assessment via /assessment/:activityId/:contextId/:id
2. Learner answers all required questions across paginated pages
3. Submit button becomes enabled (btnDisabled$ emits false)
4. Learner clicks submit

**Expected Results:**
- System calls submitAssessment with submissionId, assessmentId, contextId, and answers
- Success toast appears with 'Assessment submitted' message
- If pulse-check assessment, fast feedback is pulled
- Activity tasks refresh and assessment status updates
- Last saved timestamp displays with current time

### Scenario 2: Auto-save prevents data loss during mobile connection drop
**Steps:**
1. Learner opens assessment and begins answering questions
2. System auto-saves answers every 10 seconds
3. Learner's connection drops briefly
4. Learner reconnects and navigates back to assessment

**Expected Results:**
- Previously auto-saved answers are restored from submission
- Saving indicator shows 'Last saved' with timestamp of last successful auto-save
- No answers are lost

### Scenario 3: Navigation guard warns on unsaved changes
**Steps:**
1. Learner answers questions but last auto-save was 3 seconds ago
2. Learner clicks browser back button or navigates away

**Expected Results:**
- SinglePageDeactivateGuard prompts confirmation dialog
- If learner cancels, they remain on assessment page with answers intact
- If learner confirms, navigation proceeds and changes may be lost

### Scenario 4: Team member signs off with existing file
**Steps:**
1. Learner opens team assessment with signOff enabled
2. Page shows teammate sign-off status (some signed, some not)
3. Learner answers questions and selects existing team file by filestoreId
4. Learner enters sign-off comment and clicks 'sign off' button

**Expected Results:**
- System calls signOffTeamSubmission with submissionId and comment
- If first sign-off, submission status changes to submitted
- Teammate is listed as signed off with name, comment, timestamp
- Success toast confirms sign-off

### Scenario 5: H5P simulation completes and updates skill passport
**Steps:**
1. Learner navigates to assessment with embedded H5P task
2. H5P player loads package with content URL, frame script, stylesheet, libraries
3. Learner interacts with simulation, posting initialized and interacted xAPI statements
4. Learner completes simulation

**Expected Results:**
- H5P player posts completed xAPI statement
- Statement is forwarded to LRS with skill IRIs from alignments
- h5pTaskCompleted event fires
- If pulse-check, skill passport updates with verified capability score

### Scenario 6: Peer reviewer submits review and triggers rating
**Steps:**
1. Reviewer navigates to /review/:contextId/:id/:submissionId
2. Reviewer provides ratings and comments for each question
3. Reviewer clicks submit

**Expected Results:**
- System calls submitReview with assessmentId, reviewId, submissionId, answers
- Reviews list refreshes
- If hasReviewRating is true and user.hasReviewRating is true, review rating popup appears
- Success toast confirms review submitted

### Scenario 7: Learner uploads new file and removes it
**Steps:**
1. Learner opens file upload question with no file attached
2. Uppy upload area is visible with file input
3. Learner uploads file via TUS protocol
4. File attaches and upload area disappears
5. Learner removes attached file

**Expected Results:**
- Uppy upload area reappears immediately after file removal
- Learner can upload a different file or leave question unanswered

### Scenario 8: Timesheet assessment renders time-log component
**Steps:**
1. Learner navigates to assessment with type 'timesheet'
2. Or task with assessmentType 'timesheet'

**Expected Results:**
- Page renders app-time-log component instead of app-assessment component
- Time-log functionality is available for time tracking

## Security & Data Considerations

Assessments contain sensitive learner work and review data. File uploads cross trust boundaries to storage services via TUS protocol; files must be validated for type and size. xAPI statements from H5P and SCORM packages are forwarded to the LRS and may contain personally identifiable information tied to skill alignments. Peer reviews expose one learner's work to another; authorization must confirm the reviewer is assigned to the submission. Team sign-off allows multiple users to modify a single submission; the system must verify each team member's identity and prevent spoofing. Navigation guards prevent accidental disclosure of unsaved answers in browser history. Auto-save transmits in-progress answers over the network every 10 seconds, requiring encryption in transit. Abuse cases include uploading malicious files disguised as documents, manipulating xAPI statements to falsely claim skill completion, signing off on behalf of teammates, and repeatedly submitting duplicate assessments to inflate completion metrics.

## Interfaces

Routes: GET /assessment/:activityId/:contextId/:id, GET /assessment/:activityId/:contextId/:id/:submissionId (assessment action, canDeactivate guard), GET /review/:contextId/:id/:submissionId (review action, canDeactivate guard), GET /event/:contextId/:id (from events, no guard). APIs: getAssessment(assessmentId, action, activityId, contextId, submissionId), submitAssessment(submissionId, assessmentId, contextId, answers) returns {data: {submitAssessment: {success: boolean}}}, submitReview(assessmentId, reviewId, submissionId, answers) returns {data: {submitReview: {success: boolean}}}, signOffTeamSubmission(submissionId, comment) returns {data: {signOffTeamSubmission: {success: boolean}}}, saveFeedbackReviewed(submissionId), pullFastFeedback(). Observables: assessment$, submission$, review$, currentTask$, btnDisabled$, savingText$. Events: (save) emits {assessmentId, contextId, submissionId, answers, autoSave, signOff, signOffComment}, (readFeedback) emits submissionId, (continue) triggers next task navigation, h5pTaskCompleted from H5P player. Component inputs: [task], [assessment], [submission], [review], [contextId], [activityId], [action], [savingMessage$], [btnDisabled$], [isSinglePage]. xAPI statements: initialized, interacted, completed, terminated, answered (from H5P/SCORM/cmi5 players). Constants: SAVE_PROGRESS_TIMEOUT = 10000ms.

## Out of Scope

This specification does not cover the internal structure of question components (slider, multiple-choice, text, file-upload, team-member selectors) beyond their invocation; question-level validation logic, scoring algorithms, and rubric application are out of scope. The skill passport display, confidence bands, model keys, and verified flags are described only as consumers of xAPI data, not their calculation. Review assignment logic, reviewer selection, and review workflow orchestration beyond submission are not detailed. Time-log component functionality for timesheet assessments is mentioned but not specified. Fast feedback content, presentation, and recommendation algorithms are out of scope. The deactivation guard's specific prompt text and user confirmation flow are not defined. File type validation rules, file size limits, and virus scanning are not covered. LRS integration, xAPI statement schema validation, and skill IRI resolution are assumed external dependencies. Admin configuration of assessment types, question types, signOff flags, and hasReviewRating settings is out of scope.
