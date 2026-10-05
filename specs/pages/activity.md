# Activity Page (Mobile)

<!-- module: app-v3/pages/activity-mobile / type: page / status: draft / feature: deliver.learner.activity -->

## Overview

The activity page shows the content of a single activity: its topic content, assessment tasks, linked events, and team todos. The learner navigates from the home milestone tree to an activity. Each task type is rendered with appropriate controls (topic viewer, assessment launcher, event booking, todo checkbox). A desktop variant (`activity-desktop`) shows the same content in a wider two-column layout.

## Acceptance Criteria

- **AC1**: Activity loads the list of tasks (topics, assessments, events, team todos).
- **AC2**: Each task shows its type icon, title, and completion status.
- **AC3**: Locked tasks (lock/reveal triggers) are visually locked and non-interactive.
- **AC4**: Tapping a task navigates to the appropriate page (topic, assessment, event detail, etc.).
- **AC5**: Activity progress is shown as a percentage of completed tasks.
- **AC6**: Desktop layout shows tasks in a two-column side-by-side layout.

## Scenarios

### Scenario 1: Navigate Activity Tasks
**Steps:**
1. Learner opens an activity from the home page.
2. Sees task list: one topic, one assessment, one event.
3. Taps the topic task.

**Expected Results:**
- Navigated to the topic-mobile page.
- Topic marked as visited on return.

### Scenario 2: Locked Task
**Steps:**
1. An assessment task has a lock trigger that requires completing an earlier task first.

**Expected Results:**
- Task shows lock icon.
- Tap shows "locked" message; does not navigate to assessment.
