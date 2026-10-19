---
id: notifications-alerts
kind: capability
title: "Notifications & Alerts"
parent: system
value: "Keeps learners informed of important updates, feedback, milestone unlocks, and system announcements through in-app notifications and unlock indicators."
status: active
sources:
  - "projects/v3/src/app/pages/notifications/**"
  - "projects/v3/src/app/services/notifications.service.ts"
  - "projects/v3/src/app/services/unlock-indicator.service.ts"
tests:
  - "projects/v3/src/app/pages/notifications/**/*.spec.ts"
  - "projects/v3/src/app/services/notifications.service.spec.ts"
  - "projects/v3/src/app/services/unlock-indicator.service.spec.ts"
---

# Notifications & Alerts

## Problem & Value

Learners need timely awareness of new feedback, unlocked content, upcoming events, and system announcements to stay engaged and on track. Without proactive notifications, learners may miss critical updates, delaying progress and reducing motivation. The notifications and alerts capability consolidates all learner-facing updates into a single, accessible interface, surfacing assessment feedback, milestone and activity unlocks, chat messages, event reminders, and custom automation-triggered notices. By visually distinguishing new items and allowing quick navigation to related content, learners can act on important updates immediately, improving engagement and completion rates.

## Users & Journeys

- As a learner, I view all my notifications in one place so I know what requires my attention.
- As a learner, I tap a feedback notification and navigate directly to my graded assessment.
- As a learner, I see a visual indicator when new activities unlock so I know I can progress.
- As a learner, I mark all notifications as read to clear my notification list.
- As a learner, I receive real-time updates when new notifications arrive without refreshing the page.
- As a learner, I am prevented from accessing locked activities even if I receive a notification about them.

## Requirements

- [ ] All notifications for the learner are listed in reverse chronological order, with the most recent appearing first. <!-- claim: notifications-reverse-chronological -->
- [ ] Unread notifications and system notices are visually distinguished from read notifications so learners can identify new items at a glance. <!-- claim: unread-visual-distinction -->
- [ ] Tapping or clicking a notification navigates the learner to the relevant content, such as an assessment, review, chat, or event detail, based on the notification type. <!-- claim: notification-navigation -->
- [ ] Learners can mark all notifications as read in a single action. <!-- claim: mark-all-read -->
- [ ] New notifications arriving via push or Pusher are reflected in the notifications list without requiring a page refresh. <!-- claim: real-time-notification-updates -->
- [ ] Supported notification types include feedback_available, review_submission, chat, assessment_submission_reminder, event reminders, and system notices. <!-- claim: notification-types-supported -->
- [ ] When a learner clicks a system notice, it is marked as seen and the visual distinction is removed. <!-- claim: system-notice-seen-tracking -->
- [ ] If a learner taps a feedback notification for a locked activity, navigation is blocked and a toast message indicates the activity is locked and requires completing the previous activity first. <!-- claim: locked-activity-access-prevention -->
- [ ] Event reminder notifications navigate to event detail on mobile via a modal and to the events page with the event selected on desktop. <!-- claim: event-reminder-navigation -->
- [ ] Assessment and review notifications route to mobile-specific or desktop-specific URLs depending on the device type. <!-- claim: mobile-desktop-navigation-routing -->
- [ ] Unlocked tasks, activities, and milestones are stored in browser storage and exposed as an observable stream for components to subscribe. <!-- claim: unlock-indicator-storage -->
- [ ] When new unlock data is added, the service deduplicates entries by milestoneId, activityId, and taskId to prevent duplicate unlock indicators. <!-- claim: unlock-task-deduplication -->
- [ ] Removing an unlocked task triggers cascading removal: if no other tasks remain under the activity, the activity unlock is removed; if no other activities or tasks remain under the milestone, the milestone unlock is removed. <!-- claim: unlock-cascading-removal -->
- [ ] An activity is clearable only if it has no unlocked tasks; a milestone is clearable only if it has no unlocked activities or tasks. <!-- claim: unlock-clearable-checks -->
- [ ] All unlocked tasks are cleared from storage when switching experiences. <!-- claim: unlock-all-clear-on-switch -->
- [ ] Clearing an activity removes all unlock indicators for that activity and milestone ID, returning the list of cleared items. <!-- claim: unlock-activity-clear -->
- [ ] Unlocked tasks can be retrieved filtered by activity ID or by matching task IDs from an activity's task list. <!-- claim: unlock-tasks-by-activity -->

## Scenarios

### Scenario 1: View and Act on Notification
**Steps:**
1. Learner opens the notifications page
2. Notifications are listed in reverse chronological order
3. Learner sees unread notifications visually distinguished
4. Learner taps a feedback_available notification

**Expected Results:**
- If the associated activity is unlocked, the learner navigates to the assessment page
- If the activity is locked, a toast message is shown and navigation is blocked
- The notification remains in the list

### Scenario 2: Mark All Notifications Read
**Steps:**
1. Learner has multiple unread notifications
2. Learner taps the mark all read action

**Expected Results:**
- All notifications are marked as read
- Visual distinction for unread items is removed

### Scenario 3: Real-Time Notification Arrival
**Steps:**
1. Learner is viewing the notifications page
2. A new notification arrives via Pusher

**Expected Results:**
- The new notification appears in the list without page refresh
- The notification is visually distinguished as unread

### Scenario 4: Navigate to Event from Notification
**Steps:**
1. Learner sees an event reminder notification
2. Learner taps the notification on mobile

**Expected Results:**
- Event detail modal is displayed
- On desktop, learner is navigated to the events page with the event selected

### Scenario 5: Unlock and Clear Activity
**Steps:**
1. Learner unlocks tasks in an activity via milestone progression
2. Unlock indicators are stored and displayed
3. Learner views all tasks in the activity
4. Learner completes the last task

**Expected Results:**
- Removing the last task triggers cascading removal of the activity and milestone unlock if no other tasks remain
- Unlock indicators are removed from storage
- The activity and milestone are marked as clearable

### Scenario 6: Handle System Notice
**Steps:**
1. Learner sees a system notice in the notifications list
2. System notice is visually distinguished as unseen
3. Learner clicks the notice

**Expected Results:**
- The notice is marked as seen on the server
- Visual distinction is removed

### Scenario 7: Switch Experience Clears Unlocks
**Steps:**
1. Learner has unlocked tasks stored
2. Learner switches to a different experience

**Expected Results:**
- All unlocked tasks are cleared from storage
- Unlock indicators are reset

### Scenario 8: Desktop vs Mobile Routing
**Steps:**
1. Learner taps a review_submission notification on mobile
2. Learner taps the same notification type on desktop

**Expected Results:**
- On mobile, learner navigates to assessment-mobile/review route
- On desktop, learner navigates to v3/review-desktop route
- Both routes include relevant IDs for context, assessment, and submission

## Security & Data Considerations

Notifications contain user-specific data including assessment feedback, milestone progress, and chat messages. The service trusts that notifications are correctly scoped to the authenticated learner by the backend API. System notices marked as seen are persisted server-side. Unlock indicators are stored in browser storage and are cleared on experience switch, preventing cross-experience leakage. No explicit authorization checks are performed client-side; the system assumes the backend enforces access control for all notification content and unlock triggers.

## Interfaces

Route: /v3/notifications (notifications page). Observable streams: notification$ (todo items), systemNotices$ (system notices), eventReminder$ (event reminders), unlockedTasks$ (unlock indicators). Navigation targets: /assessment-mobile/assessment/:activityId/:contextId/:assessmentId, /v3/activity-desktop/:contextId/:activityId/:assessmentId, /assessment-mobile/review/:contextId/:assessmentId/:submissionId, /v3/review-desktop/:submissionId, /v3/messages, /v3/events. API calls: markSystemNoticesSeen (PATCH/POST). Storage keys: unlockedTasks (browser storage). Notification types: feedback_available, review_submission, chat, assessment_submission_reminder, event, system notices with title/message. Unlock models: Milestone, Activity, Task. Toast messages for locked activity warnings.

## Out of Scope

Creating or sending notifications is out of scope; this capability only displays and manages notifications created by other services or backend automation. Email or SMS notifications are not managed here. Notification preferences, filtering, or search are not supported. Marking individual notifications as read is not currently exposed, only mark-all-read. Deleting notifications is not supported. Real-time delivery mechanisms (push, Pusher) are configured elsewhere. Unlock logic and rules for when to unlock tasks, activities, or milestones are determined by other services; this capability only stores and displays unlock indicators.
