# Check-In Page (QR Attendance)

<!-- module: app-v3/pages/checkin / type: page / status: draft / feature: deliver.events.detail -->

## Overview

The check-in page provides QR-based attendance tracking for events. A learner scans the QR code displayed at the event location, and the system records their attendance for the event. The QR code encodes the event ID.

## Acceptance Criteria

- **AC1**: The learner can open the check-in page via QR scan or direct URL.
- **AC2**: The event is identified from the URL parameter (event ID).
- **AC3**: Attendance is recorded via GraphQL mutation.
- **AC4**: A confirmation message is shown after successful check-in.
- **AC5**: Duplicate check-in (already checked in) is handled gracefully.

## Scenarios

### Scenario 1: Successful Check-In
**Steps:**
1. Learner scans QR code at event location.
2. Navigated to /checkin?eventId=123.
3. System records attendance.

**Expected Results:**
- Attendance recorded via mutation.
- "Successfully checked in" confirmation shown.

### Scenario 2: Already Checked In
**Steps:**
1. Learner navigates to check-in page for an event they already attended.

**Expected Results:**
- Message: "You have already checked in to this event."
- No duplicate attendance record created.
