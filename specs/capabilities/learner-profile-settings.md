---
id: learner-profile-settings
kind: capability
title: "Learner Profile & Settings"
parent: system
value: "Allows learners to manage their personal information, notification preferences, contact details, and access support resources."
status: active
sources:
  - "projects/v3/src/app/pages/settings/**"
  - "projects/v3/src/app/pages/timesheet-approve/**"
  - "projects/v3/src/app/components/contact-number-form/**"
  - "projects/v3/src/app/components/support-popup/**"
  - "projects/v3/src/app/services/timesheet.service.ts"
tests:
  - "projects/v3/src/app/pages/settings/**/*.spec.ts"
  - "projects/v3/src/app/components/contact-number-form/**/*.spec.ts"
  - "projects/v3/src/app/components/support-popup/**/*.spec.ts"
---

# Learner Profile & Settings

## Problem & Value

Learners need a central place to manage their profile information, notification preferences, and contact details, and to access support resources when they need help. Without a self-service settings page, learners must contact administrators for routine profile updates, creating friction and delay. External supervisors who approve learner timesheets need a simple, secure way to review and approve hours without requiring a full system login. This capability provides learners with autonomy over their profile and notification settings, gives them quick access to support and documentation, and enables external supervisors to approve timesheets via a tokenized link sent by email.

## Users & Journeys

- A learner updates their profile avatar and sees the new image immediately, even while the system is still refreshing other profile data in the background.
- A learner accesses their notification preferences from the settings page to control which alerts they receive.
- A learner taps the contact support option to open a support form when they need help.
- An external supervisor opens an emailed link with a token, reviews the learner's timesheet entries for the period, enters their name, and approves or returns the hours.
- An administrator or coordinator accesses the admin console link from the settings page.
- A learner views terms and conditions from the settings page.

## Requirements

- [ ] A learner can view their name, email, and avatar on the settings page. The learner can upload a new profile avatar. <!-- claim: profile-view-and-update -->
- [ ] When a learner uploads a new avatar, the updated image remains visible even if a background profile refresh completes afterward. <!-- claim: avatar-update-persists -->
- [ ] A learner can configure notification preferences from the settings page. <!-- claim: notification-preferences -->
- [ ] A learner can access a contact support option from the settings page. <!-- claim: contact-support-access -->
- [ ] A learner can view terms and conditions from the settings page. <!-- claim: terms-and-conditions-viewable -->
- [ ] A learner can access a link to view their badges and certificates. <!-- claim: badges-and-certificates-link -->
- [ ] An administrator or coordinator can access the admin console from the settings page. <!-- claim: admin-console-access -->
- [ ] A learner can log out from the settings page. <!-- claim: logout-action -->
- [ ] When a supervisor opens the timesheet approval link, a missing or unknown token displays a message that the link is no longer valid. <!-- claim: timesheet-token-validation -->
- [ ] A submitted timesheet displays the learner's name, program name, assessment name, period start and end dates, total hours, and individual time entries with date, hours, category, and optional note. The supervisor can approve or return the timesheet. <!-- claim: timesheet-approval-display -->
- [ ] A supervisor must enter their name before approving or returning a timesheet. If the name is missing, an error message prompts the supervisor to enter their name. <!-- claim: timesheet-decision-requires-name -->
- [ ] When a supervisor approves or returns a timesheet, the decision is recorded via decideTimesheetByToken. A second use of the same token is rejected with an error message that the link is no longer valid. <!-- claim: timesheet-decision-recorded -->
- [ ] After a supervisor's decision is recorded, the page displays a confirmation that the decision was recorded and the supervisor can close the page. <!-- claim: timesheet-decision-feedback -->
- [ ] A supervisor may include an optional note when approving or returning a timesheet. <!-- claim: timesheet-optional-note -->

## Scenarios

### Scenario 1: Learner updates profile avatar
**Steps:**
1. Learner navigates to the settings page
2. Learner taps the upload button next to their avatar
3. Learner selects a new image
4. The system uploads the new avatar

**Expected Results:**
- The new avatar is displayed immediately
- If a background profile refresh completes, the new avatar remains visible

### Scenario 2: Learner accesses support and terms
**Steps:**
1. Learner navigates to the settings page
2. Learner scrolls to the Support section
3. Learner taps Contact support

**Expected Results:**
- A support popup or form opens
- Learner can also tap Terms and conditions to view them
- Learner can tap Your badges and certificates to view badges

### Scenario 3: External supervisor approves timesheet
**Steps:**
1. Supervisor receives an email with a timesheet approval link containing a token
2. Supervisor opens the link in a browser
3. The page loads showing the learner's name, program, assessment, period, total hours, and entry details
4. Supervisor enters their name
5. Supervisor optionally enters a note
6. Supervisor taps Approve

**Expected Results:**
- The decision is recorded
- A confirmation message appears that the decision was recorded
- The supervisor can close the page

### Scenario 4: External supervisor returns timesheet with feedback
**Steps:**
1. Supervisor opens the timesheet approval link
2. The page displays the submitted timesheet
3. Supervisor enters their name and a note explaining what needs correction
4. Supervisor taps Return

**Expected Results:**
- The decision is recorded with the note
- A confirmation message appears

### Scenario 5: Supervisor attempts to use expired token
**Steps:**
1. Supervisor opens a timesheet approval link with an invalid or already-used token

**Expected Results:**
- The page displays a message that the link is no longer valid
- The message instructs the supervisor to ask the learner to send a new sign-off request

### Scenario 6: Supervisor forgets to enter name
**Steps:**
1. Supervisor opens a valid timesheet approval link
2. Supervisor taps Approve without entering their name

**Expected Results:**
- An error message appears prompting the supervisor to enter their name
- The decision is not recorded until the name is provided

### Scenario 7: Admin accesses admin console
**Steps:**
1. An administrator or coordinator logs in
2. The user navigates to the settings page
3. The user taps the Admin Console link

**Expected Results:**
- The admin console opens

### Scenario 8: Learner logs out
**Steps:**
1. Learner navigates to the settings page
2. Learner taps the Log Out button

**Expected Results:**
- The learner is logged out of the application

## Security & Data Considerations

The settings page is accessible to authenticated learners and displays their own profile information. Email and name cannot be edited directly; changes require administrator intervention. The timesheet approval page at /timesheet-approve?token= is public and does not require authentication. The token query parameter is a single-use supervisor sign-off token, not a login JWT. The token grants access only to view and decide on a specific timesheet submission. After a decision is recorded, the token is invalidated and subsequent uses are rejected. Abuse cases include token reuse (mitigated by single-use validation), token guessing (mitigated by server-side token generation and validation), and unauthorized profile updates (mitigated by restricting name and email changes to administrators).

## Interfaces

Routes: /settings (authenticated learners), /timesheet-approve?token=<token> (public). GraphQL queries: timesheetByToken(token: String!) returns learner name, program name, assessment name, period dates, total minutes, status, and entries. GraphQL mutations: decideTimesheetByToken(input: DecideTimesheetByTokenInput!) with fields token, decision (approve or return), approverName, and optional note; returns status. The settings page interacts with profile update services and opens support popups, badge apps, and external links. Avatar upload uses a profile image service. The timesheet service exposes timesheetByToken and decideByToken methods.

## Out of Scope

This capability does not include editing the learner's name or email directly from the settings page; those changes require administrator action. It does not include the full contact number form or notification preference configuration UI details. It does not cover the internal implementation of the support popup, badge app, or terms and conditions content. It does not manage timesheet creation, submission, or approval by authenticated internal approvers; those are separate timesheet management capabilities. The timesheet approval page does not support multi-step workflows, bulk approvals, or detailed reporting.
