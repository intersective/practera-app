# Timesheet approval

<!-- module: app-v3/pages/timesheet-approve / type: page / status: draft -->

## Overview

`/timesheet-approve?token=` is a public page. It has no auth guard. The query token is the supervisor sign-off token, so the app does not treat it as a login JWT. An external supervisor opens the link from email, sees the learner's name, program, and the period's entries, then approves or returns the hours with their name.

## Acceptance Criteria

- A missing or unknown token shows that the link is no longer valid.
- A submitted timesheet shows the entries and Approve / Return actions.
- The decision calls `decideTimesheetByToken`. A second use of the same link is rejected.
