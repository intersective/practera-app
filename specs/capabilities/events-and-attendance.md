---
id: events-and-attendance
kind: capability
title: "Events & Attendance Management"
parent: system
value: "Enables learners to discover, book, and attend scheduled events and meetings, with QR-based check-in for physical attendance tracking."
status: active
sources:
  - "projects/v3/src/app/pages/events/**"
  - "projects/v3/src/app/pages/meeting-poll/**"
  - "projects/v3/src/app/pages/checkin/**"
  - "projects/v3/src/app/services/event.service.ts"
  - "projects/v3/src/app/services/meeting-poll.service.ts"
tests:
  - "projects/v3/src/app/pages/events/**/*.spec.ts"
  - "projects/v3/src/app/services/event.service.spec.ts"
---

# Events & Attendance Management

## Problem & Value

Event and meeting scheduling is a core coordination challenge for experiential learning programs. Learners need to discover and book sessions, workshops, and team meetings that fit their availability, while coordinators need real-time visibility into attendance and capacity. Without a unified event discovery, booking, and attendance system, learners miss opportunities, sessions run under- or over-capacity, and attendance tracking relies on manual processes prone to error. This capability delivers value by surfacing all relevant events in one place, letting learners self-service their bookings within capacity limits, enabling democratic meeting scheduling through availability polls, and streamlining attendance recording with QR-based check-in that eliminates paper sign-in sheets and manual data entry.

## Users & Journeys

- A learner browses upcoming events, sees a workshop with 3 spots left, books it, and receives confirmation.
- A coordinator creates a meeting poll with five time slots; learners vote on their availability, and the coordinator schedules the final meeting based on the results.
- A learner arrives at an event venue, scans the displayed QR code with their phone, and is instantly checked in.
- A learner cancels a booked event when plans change, freeing the spot for others.
- A learner completes an event that has an associated reflection assessment and submits it from the event detail page.
- A team member sees a prompt to rate contributions after a team meeting and navigates to the rating interface.

## Requirements

- [ ] The events page displays all bookable events and meetings associated with the learner's current experience, showing date, time, and location for each. <!-- claim: event-list-by-experience -->
- [ ] Each event in the list shows the remaining capacity and the learner's current booking status (booked, available, or full). <!-- claim: remaining-capacity-and-status -->
- [ ] Learners can book an event when capacity is available; the system updates the booking status and decrements remaining capacity. <!-- claim: book-event-when-available -->
- [ ] Learners can cancel their own booking; the system removes the booking and increments the event's remaining capacity. <!-- claim: cancel-booking -->
- [ ] The event detail page displays full event information including title, description, date, time, location, capacity, and booking controls. <!-- claim: event-detail-view -->
- [ ] Events with an associated check-in or reflection assessment display a link or button to access that assessment from the event detail. <!-- claim: associated-assessment-link -->
- [ ] QR-based check-in is initiated by navigating to /checkin with a token query parameter that encodes the event and session information. <!-- claim: qr-checkin-url-with-token -->
- [ ] When a learner opens a valid check-in URL, the system calls a GraphQL mutation (checkInSession) with the token to record attendance. <!-- claim: checkin-records-attendance -->
- [ ] After successful check-in, the page displays a success message confirming attendance was recorded and offers navigation back to the events list. <!-- claim: checkin-success-confirmation -->
- [ ] If check-in fails (invalid or expired token, already checked in, or other error), the page displays an appropriate error message and does not record duplicate attendance. <!-- claim: checkin-error-handling -->
- [ ] If the check-in URL is opened without a token parameter, the page displays a message instructing the learner to scan the QR code at the event location. <!-- claim: checkin-missing-token -->
- [ ] The meeting poll page displays all proposed time slots for a team meeting, showing the start and end time for each slot. <!-- claim: meeting-poll-display-slots -->
- [ ] Learners can select multiple time slots to indicate all times they are available, unavailable, or uncertain (maybe). <!-- claim: meeting-poll-multi-select -->
- [ ] Learners can submit their availability votes; the system records the vote for each selected slot. <!-- claim: meeting-poll-submit-availability -->
- [ ] When a learner revisits a meeting poll they have already voted on, their previously submitted availability is pre-selected. <!-- claim: meeting-poll-preselect-existing -->
- [ ] The system supports creating a new meeting poll with title, description, duration, location, deadline, and a list of proposed time slots via the createMeetingPoll mutation. <!-- claim: meeting-poll-create -->
- [ ] Each time slot in a poll displays aggregated vote counts (available, unavailable, maybe) and optionally the names of voters. <!-- claim: meeting-poll-view-votes -->
- [ ] Meeting polls have a status lifecycle (open, closed, scheduled, cancelled) that controls whether votes can still be submitted. <!-- claim: meeting-poll-status-lifecycle -->
- [ ] If the learner has team meetings awaiting contribution ratings, the events page displays a prompt banner showing the count and linking to the rating interface. <!-- claim: pending-rating-prompt -->
- [ ] When a teamId is present, the events page header includes a button to navigate to the meeting poll interface for scheduling team meetings. <!-- claim: team-meeting-schedule-navigation -->

## Scenarios

### Scenario 1: Book an Event
**Steps:**
1. Learner opens the events page and sees a list of upcoming events with dates, times, and remaining capacity
2. Learner selects an event with available spots
3. Event detail displays with full information and a 'Book' button
4. Learner clicks 'Book'

**Expected Results:**
- The event is marked as booked for the learner
- Remaining capacity decrements by one
- The booking status updates to 'Booked' in the event list and detail

### Scenario 2: Event at Full Capacity
**Steps:**
1. Learner opens the events page
2. Learner selects an event that has reached full capacity (0 spots remaining)
3. Event detail displays

**Expected Results:**
- The 'Book' button is disabled or not shown
- A message indicates the event is full
- The learner cannot book the event

### Scenario 3: Successful Check-In
**Steps:**
1. Learner arrives at an event venue
2. Learner scans the QR code displayed at the event
3. Browser opens /checkin?token=abc123
4. Page displays a loading spinner

**Expected Results:**
- The system calls checkInSession mutation with token=abc123
- Attendance is recorded in the backend
- Page displays a success icon and message: 'You're checked in! Your attendance has been recorded.'
- A button to return to the events list is shown

### Scenario 4: Already Checked In
**Steps:**
1. Learner scans the event QR code
2. Browser opens /checkin?token=abc123
3. Learner has already checked in to this event

**Expected Results:**
- The checkInSession mutation returns an error or success=false
- Page displays an error icon and message indicating duplicate check-in or that they are already checked in
- A button to return to the events list is shown

### Scenario 5: Submit Meeting Availability
**Steps:**
1. Coordinator creates a meeting poll with five time slots
2. Learner navigates to /meeting-poll?teamId=5
3. Page displays the poll title, description, and five time slots
4. Learner selects three time slots they are available for
5. Learner clicks 'Submit'

**Expected Results:**
- The system records the learner's vote for each of the three slots as 'available'
- The aggregated vote counts update to reflect the new votes
- Confirmation message or visual feedback indicates submission was successful

### Scenario 6: Cancel Event Booking
**Steps:**
1. Learner has previously booked an event
2. Learner navigates to the events page and opens the booked event detail
3. Learner clicks 'Cancel Booking'

**Expected Results:**
- The booking is removed from the learner's schedule
- Remaining capacity increments by one
- The event status updates to 'Available' in the list and detail

### Scenario 7: Access Event Assessment
**Steps:**
1. Learner attends an event that has an associated reflection assessment
2. Learner opens the event detail page

**Expected Results:**
- A link or button to the assessment is displayed
- Clicking the link opens the assessment interface with the correct context

### Scenario 8: View Pending Rating Prompt
**Steps:**
1. Learner completes a team meeting
2. Learner has not yet rated team contributions for that meeting
3. Learner opens the events page

**Expected Results:**
- A banner or card displays at the top of the page
- The prompt shows the count of meetings awaiting ratings (e.g., '1 meeting waiting for contribution ratings')
- Clicking the prompt navigates to /v3/contribution-rating

## Security & Data Considerations

Meeting polls and events are scoped to the learner's experience and team membership; the system must verify that a learner can only view and book events associated with their enrolled experiences, and only vote on polls for teams they belong to. Check-in tokens are single-use or time-limited to prevent replay attacks and unauthorized attendance claims. The checkInSession mutation must validate the token server-side and ensure the learner is authorized to attend the event. Attendance records and booking data are stored server-side and not exposed in client state beyond what is necessary for UI display. Meeting poll votes may reveal learner availability to other team members and coordinators depending on poll visibility settings; the interface should clarify who can see individual votes versus only aggregated counts.

## Interfaces

Routes: /v3/events (event list and detail), /v3/checkin?token=<token> (QR check-in), /v3/meeting-poll?teamId=<id> (meeting poll voting). GraphQL queries: teamMeetingPolls(teamId, status?) returns MeetingPoll[], which includes slots with vote counts and voter details. GraphQL mutations: checkInSession(token: String!) returns {success, message}; voteMeetingPoll(slotId, vote: 'available'|'unavailable'|'maybe') returns {success}; createMeetingPoll(input: CreateMeetingPollInput) returns MeetingPoll; cancelMeetingPoll(pollId) returns {success}. Event booking and cancellation are handled via mutations not shown in the provided code but referenced in the component logic. The EventService and MeetingPollService wrap GraphQL calls. The events page accepts route params activity_id, event_id, and multi_day_id for deep linking. The check-in page accepts a query param token. The meeting poll page accepts a query param teamId.

## Out of Scope

This spec does not cover the creation, editing, or deletion of events by coordinators or administrators; it focuses on the learner view and participation. It does not describe the scheduling or finalization flow where a coordinator selects a winning time slot from a meeting poll and creates the actual event. It does not cover notifications or reminders about upcoming events or pending polls. It does not describe the internal structure of assessment components triggered after check-in, only that a link or trigger exists. It does not specify access control rules for who can create polls or events, only that learners interact with polls for their own teams. It does not define the backend logic for generating or validating check-in tokens, only the client-side behavior when a token is present or absent.
