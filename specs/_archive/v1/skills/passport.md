# Learner skill passport

<!-- module: app/skills/passport / type: page / status: draft / feature: deliver.learner.skills-passport -->

## Overview

Learners see the published framework skills, their current level, uncertainty, and whether the score is verified capability or perception. H5P, SCORM, and cmi5 statements are forwarded to the LRS. The server attaches skill IRIs from alignments.

## Acceptance Criteria

- Pulse-check questions include legacy skill sliders 20–25 when the assessment requests them.
- The passport shows model key, score, confidence band, and verified flag.
- Simulation players post initialized, interacted, completed, and terminated statements.

## Scenarios

### Scenario 1: Passport hides unverified inference
**Steps:**
1. Load `learnerSkillPassport`.
2. Render rows where `modelKey` is `ecd-v1`.

**Expected Results:**
- Shadow model rows are labelled unverified.
- A zero capability count does not display a proficiency level as achieved.
