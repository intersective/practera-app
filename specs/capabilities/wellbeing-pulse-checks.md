---
id: wellbeing-pulse-checks
kind: capability
title: "Wellbeing & Pulse Checks"
parent: system
value: "Supports learner wellbeing by collecting brief, periodic check-ins on learner sentiment and providing visual traffic-light status indicators."
status: active
sources:
  - "projects/v3/src/app/components/traffic-light/**"
  - "projects/v3/src/app/components/traffic-light-group/**"
  - "projects/v3/src/app/services/pulsecheck.service.ts"
tests:
  - "projects/v3/src/app/components/traffic-light/**/*.spec.ts"
  - "projects/v3/src/app/components/traffic-light-group/**/*.spec.ts"
  - "projects/v3/src/app/services/pulsecheck.service.spec.ts"
---

# Wellbeing & Pulse Checks

## Problem & Value

Wellbeing pulse checks enable programs to monitor learner sentiment and mental health at regular intervals. Without periodic check-ins, educators lack early warning signals when learners struggle, reducing their ability to provide timely support. By collecting brief ratings and surfacing traffic-light status indicators, the system helps administrators identify at-risk learners while keeping the burden on learners minimal.

Pulse check completion also contributes to skills growth metrics visible in admin reporting, creating a feedback loop between wellbeing monitoring and learner development tracking. The traffic-light visual summary on the home page gives learners themselves awareness of their trajectory and provides a quick health check for program staff.

## Users & Journeys

- A learner opens the pulse check page and rates their wellbeing across multiple questions in sequence.
- A learner submits their pulse check responses and sees their traffic light indicator update on the home page.
- A learner who already completed this period's pulse check is prevented from resubmitting duplicate responses.
- An administrator views skills growth metrics that include pulse check completion data.
- A program coordinator sees traffic light group indicators that surface learner wellbeing status at a glance.
- A learner sees their skill change percentage displayed with positive or negative styling based on their pulse check trend.

## Requirements

- [ ] Pulse check questions are presented to the learner in sequence based on the configured pulse check type and question set for the current period. <!-- claim: pulse-check-questions-shown-in-sequence -->
- [ ] Learner submits a rating response for each pulse check question in the sequence. <!-- claim: learner-submits-rating-responses -->
- [ ] On successful pulse check submission, the learner's pulse check status updates and the traffic light indicator on the home page refreshes to reflect the new data. <!-- claim: submission-updates-traffic-light -->
- [ ] A learner cannot resubmit a pulse check they have already completed within the current configured period. <!-- claim: duplicate-submission-prevented -->
- [ ] Pulse check answers are persisted by invoking the submitPulseCheck GraphQL mutation. <!-- claim: answers-stored-via-graphql -->
- [ ] Skill change values returned from the API are converted to percentages (multiplied by 100 and rounded to one decimal place) for display. <!-- claim: skill-change-displayed-as-percentage -->
- [ ] Positive skill change percentages are prefixed with a plus sign and styled with the skill-change-positive CSS class. <!-- claim: positive-change-formatting -->
- [ ] Negative skill change percentages are displayed without a prefix and styled with the skill-change-negative CSS class. <!-- claim: negative-change-formatting -->
- [ ] When skill change value is zero, no change indicator is displayed to the learner. <!-- claim: zero-change-hidden -->
- [ ] Pulse check completion data contributes to skills growth metrics visible in the administrator reporting view. <!-- claim: pulse-check-contributes-to-metrics -->
- [ ] Pulse check wellbeing status is surfaced on the home page via a traffic-light group indicator that provides visual health summary. <!-- claim: traffic-light-group-surfaces-status -->

## Scenarios

### Scenario 1: Submit Pulse Check
**Steps:**
1. Learner navigates to the pulse check page during an active pulse check period
2. System displays the first question from the configured question set
3. Learner selects a rating response for the first question
4. System advances to the next question in sequence
5. Learner completes ratings for all questions in the set
6. Learner submits the pulse check

**Expected Results:**
- System invokes submitPulseCheck GraphQL mutation with all responses
- Pulse check status is marked complete for the current period
- Traffic light indicator on home page updates to reflect new wellbeing data
- Skills growth metrics in admin reporting include the completed pulse check

### Scenario 2: Already Completed
**Steps:**
1. Learner completed a pulse check earlier in the current period
2. Learner attempts to access the pulse check page again during the same period

**Expected Results:**
- System prevents the learner from resubmitting responses
- Learner sees indication that pulse check is already complete for this period

### Scenario 3: Display Positive Skill Change
**Steps:**
1. Learner completes a pulse check with improved ratings compared to previous period
2. System calculates skill change value of 0.125 from API response

**Expected Results:**
- System converts change value to 12.5%
- Display shows '+12.5%' with skill-change-positive CSS class applied

### Scenario 4: Display Negative Skill Change
**Steps:**
1. Learner completes a pulse check with decreased ratings compared to previous period
2. System calculates skill change value of -0.08 from API response

**Expected Results:**
- System converts change value to -8.0%
- Display shows '-8.0%' with skill-change-negative CSS class applied

### Scenario 5: Display No Change
**Steps:**
1. Learner completes a pulse check with identical ratings to previous period
2. System calculates skill change value of 0 from API response

**Expected Results:**
- No skill change indicator is displayed to the learner

### Scenario 6: Sequential Question Flow
**Steps:**
1. Learner opens pulse check page with a configured set of five wellbeing questions
2. Learner rates question 1 and advances
3. Learner rates question 2 and advances
4. Learner continues through questions 3, 4, and 5 in order

**Expected Results:**
- Each question is presented one at a time in the configured sequence
- Learner cannot skip questions or reorder responses
- All five responses are collected before submission is enabled

### Scenario 7: Traffic Light Reflects Wellbeing Trend
**Steps:**
1. Multiple learners in a cohort submit pulse checks over several periods
2. Administrator views the home page traffic light group

**Expected Results:**
- Traffic light indicators visually summarize each learner's wellbeing trajectory
- Colors reflect positive, neutral, or concerning trends based on pulse check data
- Administrator can quickly identify learners requiring additional support

### Scenario 8: Admin Views Growth Metrics
**Steps:**
1. Several learners complete pulse checks across multiple periods
2. Administrator navigates to skills growth reporting view

**Expected Results:**
- Pulse check completion data is included in the skills growth metrics
- Report shows correlation between pulse check trends and skill development
- Administrator can filter or segment metrics by pulse check participation

## Security & Data Considerations

Pulse check responses contain sensitive learner wellbeing and mental health data. Responses must be protected with appropriate access controls ensuring only authorized educators and administrators can view individual learner data. Learners should only see their own pulse check history and change indicators. The submitPulseCheck GraphQL mutation must authenticate the learner and validate that the submission corresponds to the authenticated user's account. Aggregated or anonymized pulse check data may be acceptable for program-level reporting, but individual responses require confidentiality. Trust boundary exists between the learner app and backend GraphQL API; all pulse check data crosses this boundary and must be transmitted securely. Abuse case: malicious user attempting to submit pulse checks on behalf of other learners or flooding the system with fake responses to skew metrics.

## Interfaces

The capability exposes the submitPulseCheck GraphQL mutation for persisting learner responses. The service provides getSkillChangeDisplayFromValue(changeValue: number) method that accepts a numeric change value and returns a SkillChangeDisplay object with text and cssClass properties, or null if change is zero. Traffic-light and traffic-light-group UI components render visual status indicators based on pulse check data. The home page integrates the traffic-light-group component to surface wellbeing status. The pulse check page UI presents questions sequentially and collects rating responses. Admin reporting interfaces consume pulse check completion data as part of skills growth metrics.

## Out of Scope

This capability does not define the scheduling logic that determines when pulse check periods begin and end; that is handled by external configuration. It does not specify the content or wording of individual pulse check questions, which are managed separately. The capability does not include automated alerting or notification workflows when learners show concerning trends; it provides data and indicators but not intervention automation. It does not define role-based access control policies for viewing pulse check data in detail; authorization is assumed to be enforced by the backend. The capability does not include direct messaging or support ticket creation from pulse check results. It does not cover integration with external mental health or counseling systems.
