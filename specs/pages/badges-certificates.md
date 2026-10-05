# Badges & Certificates Page

<!-- module: app-v3/pages/badges-certificates / type: page / status: draft / feature: deliver.credentials.learner-page -->

## Overview

The badges and certificates page shows all achievements earned by the learner. Each badge shows the credential name, description, and date earned. Where applicable, a certificate download URL is available.

## Acceptance Criteria

- **AC1**: All achievements earned by the learner are displayed. <!-- claim: earned-listed -->
- **AC2**: Each achievement shows name, description, badge image, and earned date. <!-- claim: achievement-fields -->
- **AC3**: Achievements with certificates provide a downloadable certificate URL. <!-- claim: certificate-url -->
- **AC4**: Achievements are sorted by earned date (most recent first). <!-- claim: sorted-by-earned -->

## Scenarios

### Scenario 1: View Earned Badges
**Steps:**
1. Learner navigates to Badges & Certificates.
2. GraphQL fetches learner achievements.

**Expected Results:**
- All earned badges/achievements displayed.
- Certificate download link visible where available.
