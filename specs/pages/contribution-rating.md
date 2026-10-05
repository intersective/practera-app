# Contribution Rating Page

<!-- module: app-v3/pages/contribution-rating / type: page / status: draft / feature: deliver.events.detail -->

## Overview

The contribution rating page enables peer Team 360 assessment. Learners rate the contribution of their team members on configurable dimensions. This feeds into the Team 360 report visible to coordinators in the admin app.

## Acceptance Criteria

- **AC1**: Learner sees all team members they need to rate.
- **AC2**: Rating dimensions are configurable per experience.
- **AC3**: Learner submits ratings for each team member.
- **AC4**: Previously submitted ratings are pre-filled on revisit.
- **AC5**: Self-rating is excluded (learner does not rate themselves).

## Scenarios

### Scenario 1: Rate Team Members
**Steps:**
1. Learner navigates to Contribution Rating.
2. Rates each team member on all dimensions.
3. Submits.

**Expected Results:**
- Ratings saved.
- Team 360 report in admin app reflects the submitted ratings.
