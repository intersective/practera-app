# Practera Learner App — Architecture Index

<!-- module: app-v3 / type: architecture-index / status: living / feature: deliver.learner.experience-switcher, deliver.learner.tabs-shell -->

## Overview

practera-app is an Angular 19 + Ionic learner-facing SPA. It supports both mobile and desktop responsive layouts. Auth flows via JWT token (`?token=` or direct-login). All data fetches via `practera-graphql-api` (Apollo Angular client with `apikey: JWT` header). Real-time chat via Pusher.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Angular 19 + Ionic |
| Language | TypeScript |
| GraphQL client | Apollo Angular |
| Realtime | Pusher |
| E2E | Playwright |

## Spec Directory Map
| Area | Spec Dir | Source Dir | Description |
|------|----------|-----------|-------------|
| Foundation | `specs/foundation/` | `src/app/services/` | Auth, shared services |
| Auth pages | `specs/auth/` | `src/app/pages/auth/` | Login, registration, password reset flows |
| Core pages | `specs/pages/` | `src/app/pages/` | All main learner pages |

## Pages (Value Chain: Experience Delivery)

All pages fall under value chain stage 3: Experience Delivery.

| Page | Route | Source |
|------|-------|--------|
| Home | /home | pages/home/ |
| Experiences | /experiences | pages/experiences/ |
| Activity (mobile) | /activity-mobile | pages/activity-mobile/ |
| Activity (desktop) | /activity-desktop | pages/activity-desktop/ |
| Assessment (mobile) | /assessment-mobile | pages/assessment-mobile/ |
| Review (mobile) | /review-mobile | pages/review-mobile/ |
| Review (desktop) | /review-desktop | pages/review-desktop/ |
| Topic (mobile) | /topic-mobile | pages/topic-mobile/ |
| Chat | /chat | pages/chat/ |
| Events | /events | pages/events/ |
| Badges/Certificates | /badges-certificates | pages/badges-certificates/ |
| Due Dates | /due-dates | pages/due-dates/ |
| Checkin | /checkin | pages/checkin/ |
| Settings | /settings | pages/settings/ |
| Notifications | /notifications | pages/notifications/ |
| Meeting Poll | /meeting-poll | pages/meeting-poll/ |
| Contribution Rating | /contribution-rating | pages/contribution-rating/ |
