# Settings Page

<!-- module: app-v3/pages/settings / type: page / status: draft / feature: deliver.learner.settings -->

## Overview

The settings page allows learners to update their profile information, manage notification preferences, and access support. It includes links to terms and conditions.

## Acceptance Criteria

- **AC1**: Learner can view and update their profile (name, avatar).
- **AC2**: Notification preferences can be configured.
- **AC3**: A contact support option is accessible.
- **AC4**: Terms and conditions are viewable.

## Scenarios

### Scenario 1: Update Profile
**Steps:**
1. Learner navigates to Settings.
2. Updates their display name.
3. Saves.

**Expected Results:**
- Profile updated via GraphQL mutation.
- Confirmation message shown.
