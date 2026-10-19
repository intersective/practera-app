---
id: task-deadline-tracking
kind: capability
title: "Task & Deadline Tracking"
parent: system
value: "Helps learners stay on track by surfacing all upcoming and overdue assessments, activities, and events in a unified timeline view with visual status indicators."
status: active
sources:
  - "projects/v3/src/app/pages/due-dates/**"
  - "projects/v3/src/app/components/todo-card/**"
tests:
  - "projects/v3/src/app/pages/due-dates/**/*.spec.ts"
  - "projects/v3/src/app/components/todo-card/**/*.spec.ts"
---

# Task & Deadline Tracking

## Problem & Value

Learners in experiential programs face multiple deadlines across assessments, activities, and events. Without a unified view, they risk missing due dates, submitting work late, or losing track of priorities. The Task & Deadline Tracking capability consolidates all upcoming and overdue items into a single timeline, grouped by month and colour-coded by status. Learners can search assessments by name, navigate directly to tasks, and export deadlines to their personal calendar (iCal or Google Calendar) to integrate program requirements into their daily routines. This reduces cognitive load, prevents missed submissions, and supports timely completion.

## Users & Journeys

- A learner views all upcoming assessments sorted chronologically to plan their week.
- A learner filters the timeline by assessment name to locate a specific task quickly.
- A learner taps "Go to" on an overdue item and is taken directly to the activity page.
- A learner exports a due date to Google Calendar to receive reminders on their phone.
- A learner downloads an iCal file and imports it into Outlook for desktop notifications.
- A learner sees skeleton placeholders while the page loads, then assessments grouped by month.

## Requirements

- [ ] All assessments with due dates in the learner's experience are listed on the due dates page. <!-- claim: all-due-items-listed -->
- [ ] Assessments are sorted chronologically by due date, with items lacking a due date grouped last under "No due date". <!-- claim: chronological-sorting -->
- [ ] Overdue items are visually highlighted in red to draw attention. <!-- claim: overdue-visual-indicator -->
- [ ] Completed assessments are displayed with a completion indicator. <!-- claim: completion-status-shown -->
- [ ] Assessments are grouped by month for easier scanning of upcoming and future tasks. <!-- claim: grouped-by-month -->
- [ ] Learners can search assessments by name with a 200ms debounce; only groups containing matching items are shown. <!-- claim: search-by-name -->
- [ ] A search query containing only whitespace returns all groups unchanged. <!-- claim: whitespace-search-shows-all -->
- [ ] While assessments are loading, skeleton placeholders are displayed in place of assessment names and dates. <!-- claim: skeleton-loading-state -->
- [ ] Tapping "Go to" on an assessment navigates to the route v3/activity-desktop/:contextId/:activityId/:assessmentId. <!-- claim: navigate-to-activity -->
- [ ] Learners can download an iCal (.ics) file for any assessment with a due date, triggering a browser download named "<AssessmentName>.ics". <!-- claim: ical-export -->
- [ ] Learners can open a Google Calendar URL in a new tab to add an assessment with its title, description, and due date. <!-- claim: google-calendar-export -->
- [ ] When generating a Google Calendar event, if no end time is provided, the event defaults to a one-hour duration. <!-- claim: google-calendar-default-duration -->
- [ ] The Google Calendar URL includes encoded title, description, location (if provided), and reminder in minutes (if provided). <!-- claim: google-calendar-url-parameters -->
- [ ] Dates are formatted as compact ISO 8601 strings (YYYYMMDDTHHmmssZ) for iCal and Google Calendar URLs. <!-- claim: date-format-compact-ics -->
- [ ] If iCal event creation fails, an alert is shown to the user. <!-- claim: ical-creation-error-alert -->
- [ ] If the Google Calendar URL cannot be opened (popup blocked), an alert instructs the user to allow pop-ups. <!-- claim: google-calendar-popup-blocked-alert -->
- [ ] If Google Calendar URL generation throws an error, an alert with the message "Failed to generate Google calendar URL" is shown. <!-- claim: google-calendar-generation-error-alert -->
- [ ] If the assessment service returns an error when fetching due dates, the page stops loading and displays an empty list. <!-- claim: assessment-service-error-handling -->

## Scenarios

### Scenario 1: View upcoming deadlines
**Steps:**
1. Learner navigates to the Due Dates page
2. System loads all assessments with due dates from the assessment service
3. System groups assessments by month

**Expected Results:**
- Assessments are displayed chronologically under month headings
- Items without a due date appear last under "No due date"
- Overdue items are highlighted in red

### Scenario 2: Search for specific assessment
**Steps:**
1. Learner opens the Due Dates page
2. Learner types "Assessment A" into the search bar
3. System debounces input for 200ms

**Expected Results:**
- Only groups containing "Assessment A" are displayed
- Other groups are hidden from view

### Scenario 3: Export deadline to personal calendar
**Steps:**
1. Learner taps "Add to Calendar" on an assessment
2. Learner selects "iCalendar" from the popover
3. System generates an .ics file with the assessment title, description, and due date as a compact datetime tuple
4. Browser downloads the file named "<AssessmentName>.ics"

**Expected Results:**
- Learner receives a downloadable .ics file
- File can be imported into Outlook, Apple Calendar, or other clients

### Scenario 4: Add to Google Calendar
**Steps:**
1. Learner taps "Add to Calendar" on an assessment
2. Learner selects "Google Calendar"
3. System generates a URL with encoded event details and one-hour default duration
4. System opens the URL in a new browser tab

**Expected Results:**
- Google Calendar opens in a new tab with pre-filled event details
- Learner can save the event to their calendar

### Scenario 5: Handle blocked popup
**Steps:**
1. Learner selects "Google Calendar" from the popover
2. Browser blocks the popup

**Expected Results:**
- An alert appears with the message "Please allow pop-ups for this website"

### Scenario 6: Navigate to overdue task
**Steps:**
1. Learner sees an overdue assessment highlighted in red
2. Learner taps "Go to" button

**Expected Results:**
- Browser navigates to v3/activity-desktop/:contextId/:activityId/:assessmentId

### Scenario 7: Load page with no assessments
**Steps:**
1. Learner opens the Due Dates page
2. System fetches due dates and returns an empty list

**Expected Results:**
- An empty list is displayed
- No skeleton placeholders or groups are shown

### Scenario 8: Handle service error gracefully
**Steps:**
1. Learner opens the Due Dates page
2. Assessment service throws an error

**Expected Results:**
- Page stops loading
- Empty assessment list is displayed
- No error message is shown to the user

## Security & Data Considerations

The capability displays assessment data fetched from the assessment service, which must enforce learner-level authorization to ensure users only see their own due dates. Calendar export functions generate URLs and files client-side without server validation; no sensitive data beyond what is already visible on the page is exposed. Popup blockers may prevent Google Calendar URLs from opening, triggering a user alert. No authentication boundaries are crossed, as all operations occur within the authenticated learner session.

## Interfaces

Route: /v3/due-dates (module lazy-loaded). Service: DueDatesService.generateGoogleCalendarUrl(params: GoogleCalendarParams) returns a string URL. DueDatesService.createCalendarEvent(eventData: EventAttributes) triggers a browser download. AssessmentService.dueStatusAssessments() returns an observable of assessments with id, name, description, dueDate, contextId, activityId. Template events: ionInput on ion-searchbar, click on "Go to" button, click on calendar export options in ion-popover.

## Out of Scope

The capability does not send calendar invitations via email, sync directly with external calendar APIs, or persist search queries. It does not filter by completion status or allow sorting options beyond chronological order. It does not handle recurring events, time zones beyond the learner's local browser time, or calendar conflict detection. It does not create calendar events for assessments without due dates. It does not validate whether the learner has permission to edit the activity; navigation relies on downstream authorization.
