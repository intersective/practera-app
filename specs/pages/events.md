# Events Page

<!-- module: app-v3/pages/events / type: page / status: draft / feature: deliver.events.detail, deliver.events.learner -->

## Overview

The events page shows all bookable events and meetings for the learner's experience. Learners can view event details, check capacity, and book/cancel event attendance. Events may have associated assessments. QR-based check-in is available at the event.

## Acceptance Criteria

- **AC1**: Events list shows all available events for the learner's experience with date, time, and location.
- **AC2**: Each event shows remaining capacity and booking status.
- **AC3**: Learners can book an event when capacity is available.
- **AC4**: Learners can cancel their booking.
- **AC5**: Events with an associated assessment show a link to the assessment.
- **AC6**: Event detail page shows full event information.
- **AC7**: QR-based check-in is supported via the /checkin page.

## Scenarios

### Scenario 1: Book an Event
**Steps:**
1. Learner views the events list.
2. Selects an event with available capacity.
3. Books the event.

**Expected Results:**
- Booking confirmed; event shows as booked.
- Remaining capacity decremented.
- Learner cannot double-book the same event.

### Scenario 2: Event at Full Capacity
**Steps:**
1. Learner views an event where remaining capacity = 0.

**Expected Results:**
- Book button is disabled.
- "Full" indicator shown.
