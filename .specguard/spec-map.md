# Proposed capability map

Edit `.specguard/spec-map.json`, then run the same command with `--from-map` to write the specs.

## System: Practera Learner App

Learners in work-integrated learning and experiential education programs need a unified platform to navigate their learning journey, complete assessments, collaborate with peers and mentors, and track their progress toward competencies. Without a cohesive mobile-first application, learners face fragmented experiences across multiple tools, making it difficult to stay engaged, submit work on time, communicate effectively with their team, and understand their development trajectory.

## Capabilities

| Id | Title | Value | Source globs | v1 specs absorbed |
|---|---|---|---|---|
| identity-and-access | Identity & Access Management | Enables secure, flexible authentication so learners can access their personalized learning environment via multiple pathways including JWT token handoff, direct login, and federated identity. | 4 | 1 |
| learner-dashboard | Learner Dashboard & Navigation | Provides learners with a unified home view of their current experience, milestone progress, pulse check status, and quick access to all learning pathways. | 7 | 2 |
| learning-activities | Learning Activities & Content | Delivers structured learning content through activities and topics, enabling learners to consume rich media, complete readings, and progress through their curriculum. | 7 | 2 |
| assessments-and-submissions | Assessments & Submissions | Enables learners to complete and submit diverse assessment types (text, multiple-choice, file upload, H5P, SCORM) and receive feedback, demonstrating their competency and progress. | 10 | 3 |
| peer-review-feedback | Peer Review & Feedback | Facilitates peer learning through structured review workflows where learners provide and receive feedback on submissions, contribution ratings, and fast feedback exchanges. | 10 | 2 |
| real-time-messaging | Real-Time Messaging & Collaboration | Connects learners with peers, mentors, and coordinators through real-time chat with channels, direct messages, threads, file attachments, and message editing. | 3 | 1 |
| events-and-attendance | Events & Attendance Management | Enables learners to discover, book, and attend scheduled events and meetings, with QR-based check-in for physical attendance tracking. | 5 | 3 |
| task-deadline-tracking | Task & Deadline Tracking | Helps learners stay on track by surfacing all upcoming and overdue assessments, activities, and events in a unified timeline view with visual status indicators. | 2 | 1 |
| achievements-credentials | Achievements & Credentials | Recognizes learner accomplishments by displaying earned badges, certificates, and credentials with details and achievement unlock animations. | 4 | 1 |
| wellbeing-pulse-checks | Wellbeing & Pulse Checks | Supports learner wellbeing by collecting brief, periodic check-ins on learner sentiment and providing visual traffic-light status indicators. | 3 | 1 |
| notifications-alerts | Notifications & Alerts | Keeps learners informed of important updates, feedback, milestone unlocks, and system announcements through in-app notifications and unlock indicators. | 3 | 1 |
| learner-profile-settings | Learner Profile & Settings | Allows learners to manage their personal information, notification preferences, contact details, and access support resources. | 5 | 2 |
| shared-infrastructure | Shared Infrastructure & Utilities | Provides foundational services for API communication, file handling, media processing, analytics integration, and UI utilities used across all capabilities. | 41 | 0 |

### identity-and-access

All authentication flows, password management, registration, and session handling belong together as they collectively manage user identity and system access.

- source: `projects/v3/src/app/pages/auth/**`
- source: `projects/v3/src/app/services/auth.service.ts`
- source: `projects/v3/src/app/services/oauth-pkce.ts`
- source: `projects/v3/src/app/services/storage.service.ts`

### learner-dashboard

The home page, experience switcher, tabs navigation, and main routing collectively form the learner's primary navigation and dashboard interface.

- source: `projects/v3/src/app/pages/home/**`
- source: `projects/v3/src/app/pages/experiences/**`
- source: `projects/v3/src/app/pages/tabs/**`
- source: `projects/v3/src/app/pages/v3/**`
- source: `projects/v3/src/app/app-routing.module.ts`
- source: `projects/v3/src/app/services/home.service.ts`
- source: `projects/v3/src/app/services/experience.service.ts`

### learning-activities

Activity and topic pages (both mobile and desktop variants) along with their content rendering components form the core learning content delivery system.

- source: `projects/v3/src/app/pages/activity-mobile/**`
- source: `projects/v3/src/app/pages/activity-desktop/**`
- source: `projects/v3/src/app/pages/topic-mobile/**`
- source: `projects/v3/src/app/components/activity/**`
- source: `projects/v3/src/app/components/topic/**`
- source: `projects/v3/src/app/services/activity.service.ts`
- source: `projects/v3/src/app/services/topic.service.ts`

### assessments-and-submissions

Assessment submission pages, question type components, file handling, and H5P/SCORM players collectively support the assessment submission workflow.

- source: `projects/v3/src/app/pages/assessment-mobile/**`
- source: `projects/v3/src/app/components/assessment/**`
- source: `projects/v3/src/app/components/multiple/**`
- source: `projects/v3/src/app/components/oneof/**`
- source: `projects/v3/src/app/components/slider/**`
- source: `projects/v3/src/app/components/text/**`
- source: `projects/v3/src/app/components/file-upload/**`
- source: `projects/v3/src/app/components/file-display/**`
- source: `projects/v3/src/app/components/h5p-player/**`
- source: `projects/v3/src/app/services/assessment.service.ts`

### peer-review-feedback

Review pages, review components, contribution rating, fast feedback, and review rating services together enable the peer-to-peer feedback ecosystem.

- source: `projects/v3/src/app/pages/review-mobile/**`
- source: `projects/v3/src/app/pages/review-desktop/**`
- source: `projects/v3/src/app/pages/contribution-rating/**`
- source: `projects/v3/src/app/components/review-list/**`
- source: `projects/v3/src/app/components/review-rating/**`
- source: `projects/v3/src/app/components/fast-feedback/**`
- source: `projects/v3/src/app/services/review.service.ts`
- source: `projects/v3/src/app/services/review-rating.service.ts`
- source: `projects/v3/src/app/services/contribution.service.ts`
- source: `projects/v3/src/app/services/fast-feedback.service.ts`

### real-time-messaging

All chat UI components, Pusher integration, and chat service collectively deliver the messaging and collaboration experience.

- source: `projects/v3/src/app/pages/chat/**`
- source: `projects/v3/src/app/services/chat.service.ts`
- source: `projects/v3/src/app/services/pusher.service.ts`

### events-and-attendance

Event listing, detail, booking, meeting polls, and QR check-in together manage the full event participation lifecycle.

- source: `projects/v3/src/app/pages/events/**`
- source: `projects/v3/src/app/pages/meeting-poll/**`
- source: `projects/v3/src/app/pages/checkin/**`
- source: `projects/v3/src/app/services/event.service.ts`
- source: `projects/v3/src/app/services/meeting-poll.service.ts`

### task-deadline-tracking

Due dates page, service, and related todo components provide centralized deadline awareness and task management.

- source: `projects/v3/src/app/pages/due-dates/**`
- source: `projects/v3/src/app/components/todo-card/**`

### achievements-credentials

Badges/certificates page, achievement components, popups, and service together manage credential display and celebration.

- source: `projects/v3/src/app/pages/badges-certificates/**`
- source: `projects/v3/src/app/components/achievement-pop-up/**`
- source: `projects/v3/src/app/components/badge-detail-modal/**`
- source: `projects/v3/src/app/services/achievement.service.ts`

### wellbeing-pulse-checks

Pulse check page, traffic light components, and pulse check service together deliver the wellbeing monitoring feature.

- source: `projects/v3/src/app/components/traffic-light/**`
- source: `projects/v3/src/app/components/traffic-light-group/**`
- source: `projects/v3/src/app/services/pulsecheck.service.ts`

### notifications-alerts

Notifications page, unlock indicator service, and notification service manage all alerting and update communication.

- source: `projects/v3/src/app/pages/notifications/**`
- source: `projects/v3/src/app/services/notifications.service.ts`
- source: `projects/v3/src/app/services/unlock-indicator.service.ts`

### learner-profile-settings

Settings page, contact form, support popup, and timesheet approval collectively handle learner self-service and profile management.

- source: `projects/v3/src/app/pages/settings/**`
- source: `projects/v3/src/app/pages/timesheet-approve/**`
- source: `projects/v3/src/app/components/contact-number-form/**`
- source: `projects/v3/src/app/components/support-popup/**`
- source: `projects/v3/src/app/services/timesheet.service.ts`

### shared-infrastructure

Cross-cutting services (Apollo, network, storage, modal, utils, animations, file preview, video conversion, taxonomy) and shared components support all other capabilities.

- source: `projects/v3/src/app/services/apollo.service.ts`
- source: `projects/v3/src/app/services/network.service.ts`
- source: `projects/v3/src/app/services/shared.service.ts`
- source: `projects/v3/src/app/services/modal.service.ts`
- source: `projects/v3/src/app/services/utils.service.ts`
- source: `projects/v3/src/app/services/animations.service.ts`
- source: `projects/v3/src/app/services/file-preview.service.ts`
- source: `projects/v3/src/app/services/ffmpeg.service.ts`
- source: `projects/v3/src/app/services/ngx-embed-video.service.ts`
- source: `projects/v3/src/app/services/hubspot.service.ts`
- source: `projects/v3/src/app/services/taxonomy.service.ts`
- source: `projects/v3/src/app/services/request.interceptor.ts`
- source: `projects/v3/src/app/services/types.ts`
- source: `projects/v3/src/app/services/component-cleanup.service.ts`
- source: `projects/v3/src/app/services/demo.service.ts`
- source: `projects/v3/src/app/services/version-check.service.ts`
- source: `projects/v3/src/app/components/uppy-uploader/**`
- source: `projects/v3/src/app/components/file-preview/**`
- source: `projects/v3/src/app/components/file-popup/**`
- source: `projects/v3/src/app/components/video-conversion/**`
- source: `projects/v3/src/app/components/pop-up/**`
- source: `projects/v3/src/app/components/description/**`
- source: `projects/v3/src/app/components/circle-progress/**`
- source: `projects/v3/src/app/components/img/**`
- source: `projects/v3/src/app/components/list-item/**`
- source: `projects/v3/src/app/components/bottom-action-bar/**`
- source: `projects/v3/src/app/components/team-member-selector/**`
- source: `projects/v3/src/app/components/multi-team-member-selector/**`
- source: `projects/v3/src/app/components/team-roster/**`
- source: `projects/v3/src/app/components/project-brief-modal/**`
- source: `projects/v3/src/app/components/lock-team-assessment-pop-up/**`
- source: `projects/v3/src/app/components/activity-complete-pop-up/**`
- source: `projects/v3/src/app/components/time-log/**`
- source: `projects/v3/src/app/directives/**`
- source: `projects/v3/src/app/guards/**`
- source: `projects/v3/src/app/models/**`
- source: `projects/v3/src/app/pipes/**`
- source: `projects/v3/src/app/personalised-header/**`
- source: `projects/v3/src/app/pages/devtool/**`
- source: `projects/v3/src/app/pages/page-not-found/**`
- source: `projects/v3/src/app/services/project-brief-pdf.service.ts`

## Unowned source files (28)

- projects/v3/src/app/services/achievement.service.spec.ts
- projects/v3/src/app/services/activity.service.spec.ts
- projects/v3/src/app/services/animations.service.spec.ts
- projects/v3/src/app/services/apollo.service.spec.ts
- projects/v3/src/app/services/assessment.service.spec.ts
- projects/v3/src/app/services/auth.service.spec.ts
- projects/v3/src/app/services/chat.service.spec.ts
- projects/v3/src/app/services/event.service.spec.ts
- projects/v3/src/app/services/experience.service.spec.ts
- projects/v3/src/app/services/fast-feedback.service.spec.ts
- projects/v3/src/app/services/ffmpeg.service.spec.ts
- projects/v3/src/app/services/home.service.spec.ts
- projects/v3/src/app/services/hubspot.service.spec.ts
- projects/v3/src/app/services/modal.service.spec.ts
- projects/v3/src/app/services/network.service.spec.ts
- projects/v3/src/app/services/ngx-embed-video.service.spec.ts
- projects/v3/src/app/services/notifications.service.spec.ts
- projects/v3/src/app/services/project-brief-pdf.service.spec.ts
- projects/v3/src/app/services/pulsecheck.service.spec.ts
- projects/v3/src/app/services/pusher.service.spec.ts
- projects/v3/src/app/services/request.interceptor.spec.ts
- projects/v3/src/app/services/review-rating.service.spec.ts
- projects/v3/src/app/services/shared.service.spec.ts
- projects/v3/src/app/services/storage.service.spec.ts
- projects/v3/src/app/services/taxonomy.service.spec.ts
- projects/v3/src/app/services/topic.service.spec.ts
- projects/v3/src/app/services/unlock-indicator.service.spec.ts
- projects/v3/src/app/services/utils.service.spec.ts

## Warnings

- peer-review-feedback: tests glob "projects/v3/src/app/pages/contribution-rating/**/*.spec.ts" matches no files; dropped
- events-and-attendance: tests glob "projects/v3/src/app/pages/meeting-poll/**/*.spec.ts" matches no files; dropped
- task-deadline-tracking: sources glob "projects/v3/src/app/services/due-dates.service.ts" matches no files; dropped
- task-deadline-tracking: tests glob "projects/v3/src/app/services/due-dates.service.spec.ts" matches no files; dropped
