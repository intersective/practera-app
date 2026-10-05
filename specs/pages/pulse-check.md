# Pulse Check

<!-- module: app-v3/pages/pulse-check / type: page / status: draft / feature: deliver.pulse.check -->

## Overview

Pulse checks are brief learner wellbeing surveys triggered at configured intervals. Learners see a sequence of rating questions and submit their responses. Pulse check completion contributes to the skills growth metrics visible in the admin reporting view. Pulse checks are surfaced on the home page via a traffic light group indicator.

## Acceptance Criteria

- **AC1**: Pulse check questions are shown in sequence based on the configured pulse check type and question set.
- **AC2**: Learner submits a rating response for each question.
- **AC3**: On submission, pulse check status updates and the traffic light indicator on the home page refreshes.
- **AC4**: Learner cannot resubmit a pulse check they have already completed in the current period.
- **AC5**: Pulse check answers are stored via the `submitPulseCheck` GraphQL mutation.

## Scenarios

### Scenario 1: Submit Pulse Check
**Steps:**
1. Home page shows a pulse check prompt.
2. Learner opens the pulse check.
3. Answers all rating questions.
4. Submits.

**Expected Results:**
- Answers stored via submitPulseCheck mutation.
- Traffic light indicator on home page updated.
- Pulse check prompt dismissed.

### Scenario 2: Already Completed
**Steps:**
1. Learner has already completed the pulse check for the current period.

**Expected Results:**
- Pulse check prompt not shown (or shown as completed).
- Re-submission blocked.
