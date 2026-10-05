# Home Page

<!-- module: app-v3/pages/home / type: page / status: draft / feature: deliver.learner.home -->

## Overview

The home page is the learner's main dashboard after login. It displays the current experience's milestone tree with activity progress, pulse check status (traffic light indicator), achievements, experience progress percentage, and access to the project brief modal. Supports both mobile and desktop layouts.

## Acceptance Criteria

- **AC1**: The home page loads the learner's milestones and activities for the current experience.
- **AC2**: A progress percentage is shown for the overall experience.
- **AC3**: Pulse check skills traffic light indicator is shown when pulse checks are configured.
- **AC4**: Achievements earned by the learner are displayed.
- **AC5**: Locked activities (lock/reveal triggers) are visually distinguished and not accessible.
- **AC6**: The last visited activity is tracked and highlighted on return.
- **AC7**: Bookmarked activities are persisted and displayed with a bookmark indicator.
- **AC8**: The page supports both mobile (card view) and desktop (list view) layouts.
- **AC9**: Project brief modal is accessible when project briefs are configured for the experience.
- **AC10**: My Team includes a Files section. It lists `teamFiles` for the learner's team and can register a new upload with `addTeamFile`.

## Scenarios

### Scenario 1: Load Home with Milestones
**Steps:**
1. Learner is authenticated and navigates to /home.
2. GraphQL query fetches milestones and activities for the experience.

**Expected Results:**
- Milestones shown in order with progress indicators.
- Activities shown within each milestone.
- Experience progress percentage displayed.
- Pulse check traffic light indicator visible if configured.

### Scenario 2: Locked Activity
**Steps:**
1. An activity has a lock trigger condition that is not yet met.

**Expected Results:**
- Activity is visually locked (lock icon shown).
- Learner cannot navigate into the locked activity.

### Scenario 3: Achievements Display
**Steps:**
1. Learner has earned one or more achievements.

**Expected Results:**
- Achievement badges shown on the home page.
- Newly unlocked achievement is highlighted.
