---
id: achievements-credentials
kind: capability
title: "Achievements & Credentials"
parent: system
value: "Recognizes learner accomplishments by displaying earned badges, certificates, and credentials with details and achievement unlock animations."
status: active
sources:
  - "projects/v3/src/app/pages/badges-certificates/**"
  - "projects/v3/src/app/components/achievement-pop-up/**"
  - "projects/v3/src/app/components/badge-detail-modal/**"
  - "projects/v3/src/app/services/achievement.service.ts"
tests:
  - "projects/v3/src/app/pages/badges-certificates/**/*.spec.ts"
  - "projects/v3/src/app/components/achievement-pop-up/**/*.spec.ts"
  - "projects/v3/src/app/components/badge-detail-modal/**/*.spec.ts"
  - "projects/v3/src/app/services/achievement.service.spec.ts"
---

# Achievements & Credentials

## Problem & Value

Learners invest time and effort completing program activities and milestones. Without visible recognition of their accomplishments, motivation drops and achievements feel intangible. This capability provides a central place where learners can view all earned badges and certificates, understand what they have unlocked, and download credentials they can share with employers or professional networks. By surfacing achievement details, points, and certificate URLs, the system reinforces progress and gives learners portable proof of their skills and competencies.

## Users & Journeys

- A learner completes a module and wants to see all the badges they have earned across their program.
- A learner views their badge collection to understand how many points they have accumulated and which achievements are still locked.
- A learner opens the detail of an earned badge to read its description and download the certificate PDF.
- A learner filters between regular badges and super badges to focus on higher-tier accomplishments.
- A learner with many achievements loads additional pages to see the full history of their progress.

## Requirements

- [ ] All achievements earned by the learner are displayed on the badges and certificates page. <!-- claim: all-earned-listed -->
- [ ] Each achievement displays its name, description, badge image, points (if configured), earned date (if earned), and lock or checkmark icon indicating earned status. <!-- claim: achievement-metadata-shown -->
- [ ] Achievements with certificates provide a downloadable certificate URL accessible from the badge detail view. <!-- claim: certificate-url-available -->
- [ ] Achievements are sorted by earned date with the most recently earned appearing first. <!-- claim: sorted-most-recent-first -->
- [ ] Learners can switch between viewing badges and super badges using a segment control that filters the visible list. <!-- claim: badge-type-filter -->
- [ ] The page loads achievements in increments of 10 items and provides a 'Load more' button when additional achievements are available. <!-- claim: paginated-display -->
- [ ] Badges not yet earned are displayed with a greyscale image and a lock icon to indicate they are locked. <!-- claim: unearned-shown-greyscale -->
- [ ] The service totals the points from all earned achievements and makes that sum available to the application. <!-- claim: earned-points-calculated -->
- [ ] The service indicates whether the program has configured any achievements with points greater than zero. <!-- claim: points-configured-flag -->
- [ ] The system fetches achievements for the current experience using the 'achievements' GraphQL query which returns id, name, description, type, badge, openBadge, points, isEarned, earnedDate, progress, active, and certificateUrl. <!-- claim: graphql-achievements-query -->
- [ ] The system fetches all earned badges across institutions using the 'badges' GraphQL query which returns the same fields as achievements but only for badges with email delivery enabled. <!-- claim: graphql-badges-query -->
- [ ] The system can retrieve or regenerate a certificate PDF URL for a given achievement ID, optionally personalizing it with a user name. <!-- claim: certificate-url-query -->
- [ ] The system allows changing the email address associated with an Open Badge before download by calling the rebadgeOpenBadge mutation with achievement ID and new email. <!-- claim: rebadge-open-badge -->
- [ ] Badge items can be opened with Enter or Space key, and the segment control is navigable via keyboard with proper ARIA roles and attributes. <!-- claim: keyboard-navigation -->
- [ ] While achievements are being fetched, the page displays skeleton placeholders to indicate loading state. <!-- claim: loading-skeleton -->
- [ ] When no badges match the selected filter, the page shows a centered message with an icon and encouragement to earn badges through program activities. <!-- claim: empty-state-message -->

## Scenarios

### Scenario 1: View earned badges after program completion
**Steps:**
1. Learner navigates to the Badges & Certificates page from settings.
2. System loads all achievements using the badges query.
3. System displays earned badges sorted by earned date, most recent first.

**Expected Results:**
- All earned badges appear with checkmark icons and full-color images.
- Each badge shows name, description, points, and earned date.
- Unearned badges appear greyscale with lock icons.

### Scenario 2: Filter to view super badges only
**Steps:**
1. Learner is on the Badges & Certificates page viewing regular badges.
2. Learner taps the 'Super Badges' segment button.

**Expected Results:**
- The list filters to show only achievements with type 'superbadge'.
- The segment button updates to show 'Super Badges' as selected.
- Pagination resets to page 1.

### Scenario 3: Load more achievements beyond first page
**Steps:**
1. Learner views the Badges & Certificates page with more than 10 achievements.
2. System displays the first 10 achievements and a 'Load more' button.
3. Learner clicks 'Load more'.

**Expected Results:**
- The next 10 achievements are appended to the displayed list.
- The 'Load more' button remains visible if more than 20 achievements exist.
- The button is hidden once all achievements are displayed.

### Scenario 4: Open badge detail to download certificate
**Steps:**
1. Learner views an earned badge with a certificate URL.
2. Learner clicks or presses Enter on the badge list item.
3. System opens the badge detail modal with achievement data.

**Expected Results:**
- Modal displays the achievement name, description, badge image, and earned date.
- Certificate download link is shown if certificateUrl is present.
- Modal can be dismissed to return to the list.

### Scenario 5: View achievements with points configured
**Steps:**
1. System fetches achievements from the GraphQL query.
2. At least one achievement has points greater than zero.
3. System calculates total earned points from all earned achievements.

**Expected Results:**
- isPointsConfigured flag is set to true.
- earnedPoints reflects the sum of points from earned achievements.
- Points are displayed in the badge list UI next to each achievement name.

### Scenario 6: Rebadge Open Badge with new email
**Steps:**
1. Learner opens badge detail for an earned Open Badge.
2. Learner changes the email address in the rebadge form.
3. System calls rebadgeOpenBadge mutation with achievement ID and new email.

**Expected Results:**
- Mutation updates the Open Badge email on the backend.
- Success confirmation is returned.
- Learner can download the badge with the updated email.

### Scenario 7: Navigate badges page with keyboard
**Steps:**
1. Learner uses Tab key to navigate to a badge list item.
2. Learner presses Enter or Space to open the badge detail.

**Expected Results:**
- Focus moves to the badge item with visible focus indicator.
- Enter or Space key opens the detail modal.
- Other keys do not trigger the modal.

### Scenario 8: View empty state when no badges earned
**Steps:**
1. Learner navigates to Badges & Certificates page.
2. System fetches achievements but none are earned for the selected filter.

**Expected Results:**
- A centered message with ribbon icon appears.
- Message reads 'No badges here yet' with encouragement to complete activities.
- No badge list items are shown.

## Security & Data Considerations

This capability surfaces achievement and credential data tied to the authenticated learner. The GraphQL queries (achievements, badges, certificateUrl, rebadgeOpenBadge) must verify the learner's session and only return achievements they have earned or are enrolled in. Certificate URLs should be signed or time-limited to prevent unauthorized sharing. The rebadgeOpenBadge mutation accepts an email address; it must validate that the email belongs to the authenticated user or enforce appropriate policies to prevent email spoofing or badge hijacking. Badge images and Open Badge URLs are public assets but should still be served over HTTPS to prevent tampering. No abuse cases are anticipated beyond standard session replay or credential sharing, which are mitigated by session expiry and download rate limits at the infrastructure level.

## Interfaces

Route: /v3/badges-certificates (Angular lazy-loaded module)
GraphQL Query: achievements → returns [Achievement] for current experience
GraphQL Query: badges → returns [Achievement] for all earned badges across institutions
GraphQL Query: certificateUrl(achievementId: Int!, userName: String) → returns String or null
GraphQL Mutation: rebadgeOpenBadge(achievementId: Int!, email: String!) → returns { success }
Achievement type: { id, name, description, type, badge, openBadge, points, isEarned, earnedDate, progress, active, certificateUrl }
UI Events: ionChange on segment (switches badge/superbadge filter), click/keydown.enter/keydown.space on list item (opens badge detail modal), click on 'Load more' button (appends next page of achievements)
Modal: BadgeDetailModalComponent (opened with achievement prop, displays badge metadata and certificate link)

## Out of Scope

This capability does not manage the awarding or creation of achievements; those are handled by backend services and program configuration. It does not send achievement notifications or trigger unlock animations beyond displaying the earned state in the list. Social sharing of badges, embedding badges in external profiles, and bulk download of all certificates are not part of this capability. The page does not support searching or advanced filtering beyond the badge/superbadge toggle. Real-time updates when a new badge is earned while the page is open are not implemented; the learner must refresh or navigate back to see new achievements. The service does not cache achievements locally beyond the in-memory BehaviorSubject; offline viewing is not supported.
