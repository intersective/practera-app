# Topic Page (Mobile)

<!-- module: app-v3/pages/topic-mobile / type: page / status: draft / feature: deliver.content.topic -->

## Overview

The topic page renders rich HTML content authored by coordinators via TipTap. Topics may include text, embedded images, videos, and other media. The page is read-only for learners and marks the topic as visited on load.

## Acceptance Criteria

- **AC1**: Topic content is rendered as safe HTML (sanitised).
- **AC2**: Topic is marked as visited/completed when the learner views it.
- **AC3**: Embedded media (images, videos) renders correctly.
- **AC4**: Navigation back to the parent activity is supported.

## Scenarios

### Scenario 1: View Topic Content
**Steps:**
1. Learner navigates to a topic from the activity page.
2. Topic content loads from GraphQL.

**Expected Results:**
- Rich HTML content rendered correctly.
- Topic marked as completed.
- Back navigation returns to parent activity.
