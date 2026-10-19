---
id: learning-activities
kind: capability
title: "Learning Activities & Content"
parent: system
value: "Delivers structured learning content through activities and topics, enabling learners to consume rich media, complete readings, and progress through their curriculum."
status: active
sources:
  - "projects/v3/src/app/pages/activity-mobile/**"
  - "projects/v3/src/app/pages/activity-desktop/**"
  - "projects/v3/src/app/pages/topic-mobile/**"
  - "projects/v3/src/app/components/activity/**"
  - "projects/v3/src/app/components/topic/**"
  - "projects/v3/src/app/services/activity.service.ts"
  - "projects/v3/src/app/services/topic.service.ts"
tests:
  - "projects/v3/src/app/pages/activity-mobile/**/*.spec.ts"
  - "projects/v3/src/app/pages/activity-desktop/**/*.spec.ts"
  - "projects/v3/src/app/pages/topic-mobile/**/*.spec.ts"
  - "projects/v3/src/app/components/activity/**/*.spec.ts"
  - "projects/v3/src/app/components/topic/**/*.spec.ts"
  - "projects/v3/src/app/services/activity.service.spec.ts"
  - "projects/v3/src/app/services/topic.service.spec.ts"
---

# Learning Activities & Content

## Problem & Value

Learners in work-integrated learning programs need to consume structured educational content—readings, videos, assessments, and events—in a logical sequence that guides their progression through a curriculum. Without a unified activity and topic delivery system, learners would struggle to find their tasks, understand what is complete, and access rich media content. This capability organises all learning tasks within activities and renders topic HTML content (text, images, videos) in a safe, accessible format. It provides both mobile and desktop layouts, supports navigation through task sequences, tracks completion status, and enforces prerequisites via locked tasks. By delivering a clear, consistent interface for all learning content, it enables learners to focus on learning rather than navigation, while giving program coordinators confidence that learners see content exactly as authored.

## Users & Journeys

- A learner opens an activity to see all tasks (topics, assessments, events, todos) with their completion status and type icons.
- A learner taps on an unlocked topic task and views rich HTML content including embedded images and videos, marking it complete.
- A learner attempts to access a locked task and sees a visual lock indicator with no interactive controls.
- A learner completes a topic and is automatically routed to the next task in the activity sequence.
- A desktop learner views the same activity in a two-column layout showing tasks and content side-by-side.
- A learner navigates back from a topic to the parent activity to review progress or choose another task.

## Requirements

- [ ] When a learner navigates to an activity, the system loads and displays the list of tasks (topics, assessments, events, team todos) belonging to that activity. <!-- claim: activity-loads-task-list -->
- [ ] Each task in the activity list shows its type icon, title, and current completion status (not started, in progress, done). <!-- claim: task-displays-type-icon-title-status -->
- [ ] Locked tasks are visually indicated with a lock icon and rendered non-interactive; learners cannot navigate to or interact with them until unlock conditions are met. <!-- claim: locked-tasks-non-interactive -->
- [ ] When a learner taps or clicks an unlocked task, the system navigates to the appropriate destination: topic page for topics, assessment page for assessments, event detail for events, and todo interaction for team todos. <!-- claim: task-navigation-by-type -->
- [ ] The activity displays overall progress as a percentage calculated from the number of completed tasks divided by total tasks. <!-- claim: activity-progress-percentage -->
- [ ] On desktop, the activity page renders tasks in a two-column side-by-side layout for efficient content review. <!-- claim: desktop-two-column-layout -->
- [ ] Topic content is rendered as sanitised HTML to prevent XSS attacks while preserving formatting, links, and embedded media. <!-- claim: topic-renders-safe-html -->
- [ ] When a learner views a topic and clicks continue, the system marks the topic as visited or completed and updates the task status to 'done'. <!-- claim: topic-marked-complete-on-view -->
- [ ] Embedded media within topic content (images, videos) renders correctly within the HTML content area. <!-- claim: embedded-media-renders -->
- [ ] The topic page provides navigation back to the parent activity, preserving activity context and task list state. <!-- claim: topic-back-to-activity -->
- [ ] Topic pages are routed with both activity ID and topic ID (/topic-mobile/:activityId/:id) to maintain context for progress tracking and navigation. <!-- claim: topic-route-with-activity-context -->
- [ ] Activity pages are routed by activity ID (/activity-mobile/:id or /activity-desktop/:id) and load the corresponding activity and its tasks. <!-- claim: activity-route-with-id -->
- [ ] Desktop activity routes support inline topic rendering at /activity-desktop/:id/:topicId with a deactivation guard to prevent accidental navigation away from unsaved state. <!-- claim: desktop-inline-topic-rendering -->
- [ ] Desktop activity routes support inline assessment rendering at /activity-desktop/:contextId/:id/:assessmentId with a deactivation guard. <!-- claim: desktop-inline-assessment-rendering -->
- [ ] After a learner completes a topic and it is marked done, the system automatically navigates to the next available task in the activity sequence. <!-- claim: auto-navigate-next-task -->
- [ ] If a learner clicks continue on an already-completed topic (status 'done'), the system navigates to the next task without re-marking completion. <!-- claim: continue-idempotent-for-completed -->
- [ ] When a topic page loads, it restores the current task status from the activity service to display accurate completion state even if navigated directly by URL. <!-- claim: current-task-restored-on-load -->
- [ ] While marking a topic complete, the system displays a progress indicator and disables the continue button until the server responds. <!-- claim: progress-indicator-during-topic-update -->
- [ ] Activity and topic pages set the browser page title to "[Activity Name] - Practera" or "[Topic Title] - Practera" for better browser history and bookmarking. <!-- claim: page-title-set-from-content -->
- [ ] If a topic page receives a delayed activity response after the route has changed to a different topic, the system ignores that response to avoid corrupting state. <!-- claim: late-response-ignored -->

## Scenarios

### Scenario 1: Navigate Activity Tasks
**Steps:**
1. Learner opens an activity from the home milestone tree
2. System loads activity with ID from route parameter
3. System displays task list with icons, titles, and completion status
4. Learner sees 3 done tasks, 2 in-progress tasks, and 4 locked tasks
5. Activity progress shows 33% (3 of 9 completed)

**Expected Results:**
- All tasks are listed with correct type icons
- Locked tasks show lock icon and are not clickable
- Progress percentage is accurate
- Desktop layout shows two-column view

### Scenario 2: View Topic Content
**Steps:**
1. Learner taps an unlocked topic task from the activity page
2. System navigates to /topic-mobile/:activityId/:topicId
3. System loads topic content via topic service
4. Topic HTML content renders with embedded image and video
5. Page title updates to "[Topic Title] - Practera"

**Expected Results:**
- Topic content displays as sanitised HTML
- Embedded media renders correctly
- Continue button is enabled and visible

### Scenario 3: Complete Topic and Continue
**Steps:**
1. Learner views topic content on topic page
2. Learner clicks Continue button
3. System disables button and shows progress indicator
4. System calls topic service to mark topic complete with 'completed' status
5. Server responds successfully, system updates activity cache
6. System navigates to next task in activity sequence

**Expected Results:**
- Topic status updates to 'done'
- Activity progress percentage increases
- Next task page loads automatically
- Continue button re-enables after navigation

### Scenario 4: Locked Task
**Steps:**
1. Learner views activity with locked tasks due to prerequisite rules
2. System renders locked tasks with lock icon
3. Learner taps a locked task
4. System does not navigate or respond to tap

**Expected Results:**
- Locked task is visually distinct
- No navigation occurs
- Task remains non-interactive until unlocked

### Scenario 5: Desktop Inline Topic View
**Steps:**
1. Desktop learner opens activity at /activity-desktop/:id
2. System displays activity in two-column layout
3. Learner clicks a topic task
4. System navigates to /activity-desktop/:id/:topicId
5. Topic content renders in the content column alongside task list

**Expected Results:**
- Two-column layout maintained
- Topic content visible while task list remains in view
- Deactivation guard prompts if navigating away with unsaved state

### Scenario 6: Already Completed Topic
**Steps:**
1. Learner navigates to a topic with status 'done'
2. Topic page loads and displays content
3. Learner clicks Continue button
4. System checks task status is already 'done'
5. System navigates to next task without calling completion API

**Expected Results:**
- No duplicate completion API call
- Navigation proceeds immediately
- Activity progress unchanged

### Scenario 7: Restore Task Status on Direct Navigation
**Steps:**
1. Learner bookmarks a topic URL /topic-mobile/55/33
2. Learner opens bookmarked URL directly
3. Topic page loads, route params are 55 and 33
4. Current task is not in cache, so page calls activity service
5. Activity service returns activity with task ID 33, type Topic, status 'in progress'
6. System restores currentTask from activity response

**Expected Results:**
- Task status displays correctly as 'in progress'
- Continue button shows appropriate label
- Late responses from old routes are ignored if route has changed

### Scenario 8: Navigate Back to Activity
**Steps:**
1. Learner is viewing a topic at /topic-mobile/12/7
2. Learner clicks back button in header
3. System navigates to /activity-mobile/12
4. Activity page reloads with updated task statuses

**Expected Results:**
- Activity task list shows updated completion for topic 7
- Overall activity progress reflects latest state
- Page title updates to activity name

## Security & Data Considerations

Topic HTML content is sanitised before rendering to prevent XSS attacks. No authentication or authorization logic is visible in these pages; it is assumed to be enforced upstream by guards or interceptors. Topics and activities are fetched by numeric IDs in route parameters; the backend must validate that the authenticated learner has access to the requested activity and topic. Embedded media URLs in topic content should be validated server-side to prevent malicious redirects. No sensitive data is logged or exposed in page titles beyond activity and topic names. The system trusts the activity service and topic service to enforce business rules around task locking and completion.

## Interfaces

Routes: /activity-mobile/:id, /activity-desktop/:id, /activity-desktop/:id/:topicId, /activity-desktop/:contextId/:id/:assessmentId, /topic-mobile/:activityId/:id. Services: ActivityService exposes activity$ observable, getActivity(id, refresh, task, callback), goToTask(task, desktop), goToNextTask(task), currentTask$ observable. TopicService exposes topic$ observable, getTopic(id), updateTopicProgress(id, status, attention). Events: (navigate) emitted from app-activity component with Task payload, (continue) emitted from app-topic component with optional TopicContinueEvent payload containing attention flag. Guards: SinglePageDeactivateGuard used on desktop routes to warn before leaving with unsaved state.

## Out of Scope

This capability does not handle activity creation, editing, or authoring of topic content (that is a coordinator function). It does not manage assessment submission logic beyond navigation to assessment pages. Team todo completion and event booking are navigated to but not implemented here. Complex task unlocking rules (lock/reveal triggers) are not evaluated in these pages; the activity service provides pre-computed lock status. Real-time collaboration, offline support, and content versioning are not in scope. The capability does not implement search, filtering, or sorting of tasks within an activity.
