# Notifications Page

<!-- module: app-v3/pages/notifications / type: page / status: draft / feature: deliver.notify.learner-feed -->

## Overview

The notifications page shows all in-app notifications for the learner: assessment feedback, milestone unlocks, chat messages, system announcements, and custom ELSA automation-triggered notifications. Notifications can be marked as read individually or all at once.

## Acceptance Criteria

- **AC1**: All notifications for the learner are listed in reverse chronological order.
- **AC2**: Unread notifications are visually distinguished.
- **AC3**: Tapping a notification navigates to the relevant content.
- **AC4**: Learner can mark all notifications as read.
- **AC5**: New notifications from push/Pusher are reflected without page refresh.

## Scenarios

### Scenario 1: View and Act on Notification
**Steps:**
1. Learner navigates to Notifications.
2. Sees an unread assessment feedback notification.
3. Taps it.

**Expected Results:**
- Notification marked as read.
- Learner navigated to the relevant assessment/feedback.
