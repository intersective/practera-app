---
id: peer-review-feedback
kind: capability
title: "Peer Review & Feedback"
parent: system
value: "Facilitates peer learning through structured review workflows where learners provide and receive feedback on submissions, contribution ratings, and fast feedback exchanges."
status: active
sources:
  - "projects/v3/src/app/pages/review-mobile/**"
  - "projects/v3/src/app/pages/review-desktop/**"
  - "projects/v3/src/app/pages/contribution-rating/**"
  - "projects/v3/src/app/components/review-list/**"
  - "projects/v3/src/app/components/review-rating/**"
  - "projects/v3/src/app/components/fast-feedback/**"
  - "projects/v3/src/app/services/review.service.ts"
  - "projects/v3/src/app/services/review-rating.service.ts"
  - "projects/v3/src/app/services/contribution.service.ts"
  - "projects/v3/src/app/services/fast-feedback.service.ts"
tests:
  - "projects/v3/src/app/pages/review-mobile/**/*.spec.ts"
  - "projects/v3/src/app/pages/review-desktop/**/*.spec.ts"
  - "projects/v3/src/app/components/review-list/**/*.spec.ts"
  - "projects/v3/src/app/components/review-rating/**/*.spec.ts"
  - "projects/v3/src/app/components/fast-feedback/**/*.spec.ts"
  - "projects/v3/src/app/services/review-rating.service.spec.ts"
  - "projects/v3/src/app/services/fast-feedback.service.spec.ts"
---

# Peer Review & Feedback

## Problem & Value

Peer learning through structured feedback is essential for developing critical thinking, communication skills, and professional collaboration capabilities. Without peer review workflows, learners miss opportunities to reflect on others' work, receive diverse perspectives, and practice constructive feedback—skills vital in modern workplaces. This capability enables learners to provide and receive feedback on submissions, rate team contributions, and exchange fast feedback, creating a collaborative learning environment where peers learn from each other and develop evaluation skills. Coordinators and mentors gain visibility into team dynamics and individual engagement through contribution ratings. The system supports both submission-based reviews (where reviewers answer structured questions about a peer's work) and contribution assessments (where team members rate each other's participation). By making peer feedback a structured, trackable activity, the platform ensures accountability while fostering a culture of continuous improvement and mutual support.

## Users & Journeys

- A learner navigates to the reviews page, sees all pending peer reviews assigned to them, selects a submission to review, answers reviewer questions, and submits feedback.
- A team member opens the contribution rating page after a team event, rates each teammate's participation across configured dimensions, and submits the ratings.
- A learner who previously submitted a review returns to view their completed feedback in read-only mode to reference what they wrote.
- A mentor assigned to review a learner's submission provides structured feedback through reviewer-specific questions that complement the learner's assessment questions.
- A learner on desktop views their review list and selected submission side-by-side, completing the review without switching pages.
- A coordinator views aggregated contribution ratings in the admin interface to understand team dynamics and individual engagement patterns.

## Requirements

- [ ] The review page displays all reviews assigned to the current user, showing assessment name, submitter name, team name when applicable, due or completion date, and completion status. <!-- claim: assigned-reviews-listed -->
- [ ] When a reviewer opens a submission for review, the learner's submitted answers are displayed in read-only mode alongside the reviewer's questions. <!-- claim: submission-answers-read-only -->
- [ ] Reviewers can answer all reviewer-specific questions configured for the assessment, which are distinct from the questions the original submitter answered. <!-- claim: reviewer-questions-answerable -->
- [ ] Reviewers can save progress on incomplete reviews and submit completed reviews; submission marks the review as done and prevents further editing. <!-- claim: review-save-and-submit -->
- [ ] Once a review is submitted or acknowledged, it is displayed in read-only mode and cannot be modified. <!-- claim: completed-review-read-only -->
- [ ] The desktop review page displays the review list and selected submission side-by-side, with the review list in a left column and the assessment content in a right column, supporting navigation between reviews without page transitions. <!-- claim: desktop-side-by-side -->
- [ ] The contribution rating page loads all team members the learner must rate for a given event, excluding the learner themselves from the rating targets. <!-- claim: contribution-rating-targets-loaded -->
- [ ] Contribution rating dimensions are configurable per experience, allowing different programs to assess different aspects of team participation. <!-- claim: configurable-rating-dimensions -->
- [ ] Learners submit contribution ratings for each team member, with each rating including a score or a not-present indicator, which are recorded against the event and team. <!-- claim: contribution-ratings-submitted -->
- [ ] When a learner revisits the contribution rating page for an event where they have already submitted ratings, the previously submitted scores are pre-filled and marked as already rated. <!-- claim: previously-submitted-ratings-displayed -->
- [ ] Reviewers can submit a rating for a review they received, including a numeric rating, optional comment, and optional tags, which is recorded against the review. <!-- claim: review-rating-submission -->
- [ ] The system retrieves pending contribution ratings for the current user, returning event details, team information, and the list of teammates to rate with their already-rated status. <!-- claim: pending-contribution-ratings-fetched -->
- [ ] The system can create contribution rating todos on demand, ensuring that learners have pending tasks for events requiring peer contribution assessment. <!-- claim: contribution-todos-created -->
- [ ] Reviews are fetched via GraphQL query, returning review ID, completion status, dates, assessment details, submission details including submitter and team names, and context ID. <!-- claim: reviews-fetched-graphql -->
- [ ] Selecting a review from the list navigates to the assessment page in review mode, passing context ID, assessment ID, and submission ID for loading the review interface. <!-- claim: review-navigation-from-list -->

## Scenarios

### Scenario 1: Submit peer review on mobile
**Steps:**
1. Learner opens the reviews page on mobile
2. Learner sees a list of pending and completed reviews
3. Learner taps on a pending review for a teammate's submission
4. System displays the teammate's submission answers in read-only mode with reviewer questions below
5. Learner answers all reviewer questions
6. Learner taps submit

**Expected Results:**
- Review is marked as done
- Review appears in the completed section of the review list
- Learner can view the submitted review in read-only mode but cannot edit it

### Scenario 2: Complete contribution ratings after team event
**Steps:**
1. Learner navigates to contribution rating page
2. System displays event details and list of teammates to rate
3. Learner rates each teammate on configured dimensions with scores
4. Learner marks one teammate as not present
5. Learner submits the ratings

**Expected Results:**
- All ratings are recorded against the event and team
- Success confirmation is shown
- Revisiting the page shows the previously submitted ratings pre-filled

### Scenario 3: Review submission on desktop with side-by-side view
**Steps:**
1. Reviewer opens the review desktop page
2. System displays review list on the left and the first pending review content on the right
3. Reviewer reads the submission answers and completes reviewer questions
4. Reviewer saves progress
5. Reviewer selects a different review from the list

**Expected Results:**
- First review progress is saved without marking it done
- Second review loads in the right pane without page refresh
- Reviewer can continue working on multiple reviews in sequence

### Scenario 4: Mentor provides feedback on learner submission
**Steps:**
1. Mentor is assigned a review for a learner's project submission
2. Mentor opens the review from the reviews page
3. Mentor views the learner's answers and project artifacts
4. Mentor answers structured mentor-specific questions about the submission quality
5. Mentor submits the review

**Expected Results:**
- Review is recorded as complete
- Learner can view the mentor's feedback
- Review appears in the mentor's completed reviews list

### Scenario 5: Rate a review received
**Steps:**
1. Learner receives feedback from a peer reviewer
2. Learner views the review
3. Learner decides to rate the quality of the review received
4. Learner submits a rating with a score, comment, and tags

**Expected Results:**
- Review rating is recorded against the assessment review
- Rating includes numeric score, comment, and selected tags

### Scenario 6: View pre-filled contribution ratings
**Steps:**
1. Learner previously submitted contribution ratings for a team event
2. Learner navigates back to the contribution rating page for the same event
3. System loads the event and teammates

**Expected Results:**
- Previously submitted ratings are displayed for each teammate
- Each teammate shows already-rated status
- Learner can see their prior scores

### Scenario 7: Desktop reviewer completes multiple reviews in session
**Steps:**
1. Reviewer opens desktop review page with five pending reviews
2. First review loads automatically in the right pane
3. Reviewer completes and submits the first review
4. System marks review as done
5. Reviewer clicks the second review in the list

**Expected Results:**
- First review moves to completed section
- Second review loads in the right pane
- Review list updates to show current selection
- Reviewer can efficiently process all reviews without leaving the page

## Security & Data Considerations

Reviews are filtered by the authenticated user's assignments; a learner can only see reviews they are assigned to complete or have completed. Contribution ratings are scoped to the learner's team and event participation; learners cannot rate members of teams they do not belong to. Review submission endpoints must validate that the submitter is an authorized reviewer for the given submission. Contribution rating submissions must verify the learner is part of the specified team and event. Review rating submissions must confirm the learner is the recipient of the review being rated. All GraphQL queries and mutations require authentication. Self-rating is explicitly excluded in contribution assessments to prevent bias. Submitted reviews and ratings are immutable to preserve audit trails.

## Interfaces

Routes: `/reviews` (mobile review list), `/reviews/:submissionId` (desktop review with optional submission parameter). GraphQL queries: `reviews` (fetches assigned reviews with assessment, submission, submitter, team, and status), `pendingContributionRatings` (fetches events, teams, and targets for contribution assessment). GraphQL mutations: `submitReviewRating(assessmentReviewId, rating, comment, tags)` returns success status; `submitMeetingContributions(eventId, ratings[])` accepts array of ContributionRatingInput with targetUserId, score, and notPresent flag, returns success and optional message; `ensureContributionTodos` creates pending contribution todos and returns count created. The review list component emits navigate events with Review objects. The assessment component in review mode accepts assessment, submission, review, and action parameters and emits save events. Review data includes assessmentId, submissionId, isDone, name, submitterName, date, teamName, contextId, and status. ContributionTarget includes userId, name, and alreadyRated boolean.

## Out of Scope

This capability does not handle the creation or configuration of assessment questions, reviewer assignment logic, or scheduling of review deadlines—those are managed by assessment configuration. It does not generate or display aggregated contribution reports or Team 360 dashboards (those are admin app features). It does not include fast feedback workflows beyond the service interface. Notification or reminders for pending reviews are not part of this capability. Peer review rubrics, scoring algorithms, or automated quality checks on feedback are out of scope. The capability does not manage team formation or event scheduling.
