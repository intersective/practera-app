# Meeting Poll Page

<!-- module: app-v3/pages/meeting-poll / type: page / status: draft / feature: deliver.events.detail -->

## Overview

The meeting poll page allows learners to vote on available meeting time slots proposed by a coordinator. The learner selects all time slots they are available for, and the coordinator uses the aggregated responses to schedule the final meeting time.

## Acceptance Criteria

- **AC1**: Available meeting time slots are displayed for the learner.
- **AC2**: Learner can select multiple available time slots.
- **AC3**: Learner can submit their availability.
- **AC4**: Previously submitted availability is pre-selected on revisit.

## Scenarios

### Scenario 1: Submit Meeting Availability
**Steps:**
1. Learner navigates to Meeting Poll.
2. Selects available time slots.
3. Submits.

**Expected Results:**
- Availability recorded.
- Confirmation message shown.
