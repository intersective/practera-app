---
id: learner-dashboard
kind: capability
title: "Learner Dashboard & Navigation"
parent: system
value: "Provides learners with a unified home view of their current experience, milestone progress, pulse check status, and quick access to all learning pathways."
status: active
sources:
  - "projects/v3/src/app/pages/home/**"
  - "projects/v3/src/app/pages/experiences/**"
  - "projects/v3/src/app/pages/tabs/**"
  - "projects/v3/src/app/pages/v3/**"
  - "projects/v3/src/app/app-routing.module.ts"
  - "projects/v3/src/app/services/home.service.ts"
  - "projects/v3/src/app/services/experience.service.ts"
tests:
  - "projects/v3/src/app/pages/home/**/*.spec.ts"
  - "projects/v3/src/app/pages/experiences/**/*.spec.ts"
  - "projects/v3/src/app/pages/tabs/**/*.spec.ts"
  - "projects/v3/src/app/pages/v3/**/*.spec.ts"
  - "projects/v3/src/app/services/home.service.spec.ts"
  - "projects/v3/src/app/services/experience.service.spec.ts"
---

# Learner Dashboard & Navigation

## Problem & Value

Learners enrolled in multiple programs or experiences need a clear way to navigate between them and view their current progress. Without a unified dashboard and navigation system, learners struggle to find their activities, track milestones, check submissions due, or see their overall achievement status. The Learner Dashboard & Navigation capability provides a home view showing the current experience's milestone tree, activity progress, pulse check status, achievements, and quick access to switch experiences. It includes responsive tab navigation for mobile and a collapsible sidebar for desktop, ensuring learners can efficiently access their learning content, messages, reviews, events, and settings from any device.

## Users & Journeys

- As a learner who just logged in, I see my home dashboard displaying my current experience's milestones and overall progress percentage
- As a learner with multiple experiences, I navigate to the experiences page to switch between different programs and see progress for each
- As a mobile learner, I use the bottom tab bar to navigate between home, events, reviews, messages, due dates, and settings
- As a desktop learner, I use the collapsible left sidebar menu to navigate to different sections and see notification badges
- As a learner with locked activities, I see which activities are unavailable due to lock/reveal triggers and cannot access them until unlocked
- As a learner returning to my course, the system highlights the last activity I visited so I can resume quickly

## Requirements

- [ ] The home page loads and displays the learner's milestones and activities for the currently selected experience. <!-- claim: home-dashboard-loads-experience -->
- [ ] The home page shows an overall progress percentage for the current experience. <!-- claim: experience-progress-percentage -->
- [ ] When pulse checks are configured for the experience, a traffic light indicator showing pulse check skill status is displayed on the home page. <!-- claim: pulse-check-traffic-light -->
- [ ] Achievements earned by the learner within the current experience are displayed on the home page. <!-- claim: achievements-display -->
- [ ] Activities that are locked by lock/reveal triggers are visually distinguished and not accessible to the learner until unlocked. <!-- claim: locked-activities-distinguished -->
- [ ] The system tracks and highlights the last visited activity when the learner returns to the home page. <!-- claim: last-visited-activity-tracking -->
- [ ] Bookmarked activities are persisted and displayed with a bookmark indicator on the home page. <!-- claim: bookmarked-activities-persisted -->
- [ ] The home page supports both mobile (card view) and desktop (list view) responsive layouts. <!-- claim: responsive-layout-support -->
- [ ] When project briefs are configured for the experience, the project brief modal is accessible from the home page. <!-- claim: project-brief-modal-access -->
- [ ] The My Team section on the home page includes a Files list displaying teamFiles for the learner's team and supports registering new uploads via addTeamFile. <!-- claim: team-files-section -->
- [ ] On mobile devices without a left sidebar, a bottom tab bar provides navigation to home, events, reviews (if configured), messages (if enabled), due dates, and settings tabs. <!-- claim: tab-navigation-mobile -->
- [ ] On desktop devices, a collapsible left sidebar menu provides navigation to home, messages, reviews, events, due dates, notifications, settings, badges/certificates, and my experiences. <!-- claim: sidebar-navigation-desktop -->
- [ ] Unread message counts and pending review counts are displayed as badges on the messages and reviews tabs or menu items. <!-- claim: notification-badges-on-tabs -->
- [ ] The experiences page displays all experiences the learner is enrolled in as a grid of cards, each showing the experience name, lead image or logo, and progress percentage if available. <!-- claim: experience-switcher-page -->
- [ ] Selecting an experience from the experiences page switches the learner's current context and navigates to the home page for that experience. <!-- claim: experience-selection-switches-context -->
- [ ] All learner navigation routes (v3, experiences, topics, assessments, checkin) require authentication via AuthGuard and redirect unauthenticated users to the login page. <!-- claim: auth-guard-protection -->
- [ ] Tab navigation and sidebar menu items support keyboard navigation (Enter, Space) for accessibility. <!-- claim: keyboard-navigation-support -->
- [ ] The ion-split-pane layout automatically shows or hides the sidebar menu based on screen width, controlled by the splitpaneEnabled property. <!-- claim: split-pane-responsive-behavior -->

## Scenarios

### Scenario 1: Load Home with Milestones
**Steps:**
1. Authenticated learner navigates to /v3/home
2. System loads current experience data via GraphQL
3. System retrieves milestones, activities, progress percentage, achievements, and pulse check status

**Expected Results:**
- Home page displays milestone tree with activity progress
- Overall experience progress percentage is shown
- Achievements are listed
- Pulse check traffic light indicator appears if pulse checks are configured
- Locked activities are visually distinguished and not clickable

### Scenario 2: Switch Between Experiences
**Steps:**
1. Learner with multiple enrollments navigates to /experiences
2. System loads all enrolled experiences with progress data
3. Learner clicks on a different experience card

**Expected Results:**
- Experiences page displays grid of experience cards with names, images, and progress badges
- Selecting an experience switches the current context
- Learner is navigated to /v3/home showing the selected experience's milestones and progress

### Scenario 3: Navigate via Mobile Tabs
**Steps:**
1. Learner on mobile device (no left sidebar) views the home page
2. Bottom tab bar displays home, events, reviews, messages, due dates, settings icons
3. Learner taps the messages tab

**Expected Results:**
- Tab bar highlights the selected tab
- Navigation switches to the messages page
- Unread message badge count is visible on the messages icon if there are unread messages

### Scenario 4: Navigate via Desktop Sidebar
**Steps:**
1. Learner on desktop device (split-pane enabled) views the home page
2. Left sidebar menu displays with icons and labels for all navigation items
3. Learner clicks the 'Due Dates' menu item

**Expected Results:**
- Sidebar menu is visible and optionally collapsible
- Selected menu item is highlighted with 'selected' class
- Navigation switches to the due dates page
- Notification badges and dots appear on menu items with pending items

### Scenario 5: Locked Activity Display
**Steps:**
1. Learner views home page with activities subject to lock/reveal triggers
2. One or more activities are locked based on trigger conditions
3. Learner attempts to click or tap a locked activity

**Expected Results:**
- Locked activities are visually marked (e.g., lock icon, grayed out)
- Locked activities do not navigate or open when clicked
- Learner cannot access locked activity content until unlock conditions are met

### Scenario 6: Last Visited Activity Highlight
**Steps:**
1. Learner opens and works on Activity A
2. Learner navigates away from home page
3. Learner returns to home page

**Expected Results:**
- Activity A is highlighted or marked as the last visited activity
- Learner can quickly identify where to resume their work

### Scenario 7: Collapse and Expand Sidebar
**Steps:**
1. Learner on desktop views the sidebar in expanded state
2. Learner clicks the collapse/expand button in the sidebar footer
3. Sidebar collapses to icon-only view

**Expected Results:**
- Sidebar animates to collapsed state showing only icons
- Tooltip titles appear on hover over collapsed menu items
- Collapse button icon changes direction (e.g., arrow left to arrow right)
- Clicking again re-expands the sidebar with labels

### Scenario 8: Experience Progress Display
**Steps:**
1. Learner navigates to /experiences page
2. System fetches progress data for each enrolled experience
3. Each experience card displays progress percentage and visual progress indicator

**Expected Results:**
- Progress percentage badge overlays the experience card image
- Linear progress bar below the card shows completion percentage
- Progress label reads 'X% complete'
- Experiences with no progress data do not show progress indicators

## Security & Data Considerations

The capability handles learner authentication state and personal progress data. All navigation routes except /auth are protected by AuthGuard, which verifies JWT token presence and validity. The experiences switcher and home dashboard display learner-specific milestone progress, achievements, team files, and activity status. Trust boundary: client-side routing relies on backend GraphQL API (apikey: JWT header) to enforce enrollment and access rules. Abuse cases: attempting to navigate to /v3 or /experiences without authentication redirects to /auth/login; attempting to switch to an experience the learner is not enrolled in must be blocked by the backend API, not client-side routing alone. The client displays only experiences returned by the authenticated user's query. Notification badges (unread messages, pending reviews) expose counts but not content. Team file uploads via addTeamFile must validate file type, size, and team membership on the backend.

## Interfaces

Routes: /v3 (authenticated home), /v3/home (dashboard), /experiences (experience switcher), /v3/messages, /v3/reviews, /v3/events, /v3/due-dates, /v3/settings, /v3/notifications, /v3/badges-certificates, /auth/login (unauthenticated), /topic-mobile, /assessment-mobile, /checkin, /timesheet-approve. GraphQL queries via Apollo Angular client (header apikey: JWT): fetch experiences, milestones, activities, progress, achievements, pulse check status, team files. Commands: switchProgram(experience), addTeamFile(file), toggleMenu(), setCurrentTab(). Events: ionTabsDidChange (tab selection), @openClose animation (sidebar collapse/expand). UI components: ion-tabs, ion-tab-bar, ion-menu, ion-split-pane, app-personalised-header. The experiences page emits progress data as progresses[projectId] map. The home page template receives milestone tree, achievements array, and pulse check trafficLight indicator from HomeService.

## Out of Scope

This capability does not cover the detailed content or logic within individual tabs (messages, reviews, events, due dates, settings) or activity pages (topic-mobile, assessment-mobile). It does not define how milestones are structured, how pulse checks are calculated, or how achievements are earned—those are separate capabilities. It does not handle user registration, password reset, or initial authentication flow (covered by auth capability). It does not define the GraphQL schema or backend authorization logic. It does not specify file storage, upload limits, or virus scanning for team files. It does not cover offline mode, caching strategies, or real-time updates (Pusher integration for chat is mentioned in architecture but not part of navigation). The devtool and timesheet-approve routes are out of scope for standard learner navigation. The capability does not define the visual design, color palette, or branding customization rules.
