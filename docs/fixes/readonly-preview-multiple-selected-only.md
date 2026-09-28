---
status: stable
authority: historical
scope: frontend
last_reviewed: 2026-07-16
supersedes: CORE-8277 all-choice checkbox feedback presentation
---

# readonly selected answers and reviewer feedback context

## rule

CORE-8225 selected-only rendering remains the rule for read-only checkbox feedback. Show the union
of choices selected by the learner or reviewer; never show unselected choices. If both selected the
same choice, render it once with both ownership labels.

Reviewer-only groups are hidden from learner answering and pending-review views. After feedback is
published, every group containing only reviewer-only questions is shown under **Reviewer Feedback**.
The section establishes answer ownership, so its responses do not repeat **Reviewer's Answer**.

## display behaviour

| context | choices | ownership labels |
|---|---|---|
| learner viewing a shared question | selected learner/reviewer values only | **Your Answer** and **Reviewer's Answer** |
| reviewer viewing a shared question | selected learner/reviewer values only | **Learner's Answer** and **Reviewer's Answer** |
| learner viewing **Reviewer Feedback** | reviewer-selected values only | none; the section supplies context |
| learner answering or waiting for review | reviewer-only groups hidden | existing authoring behaviour |
| reviewer authoring or viewing a review | configured groups and order unchanged | existing reviewer behaviour |

## implementation

### assessment groups

- A group is reviewer-only when it has at least one question and every question is marked
  `reviewerOnly`, or has `reviewer` as its sole audience.
- `displayGroups` removes reviewer-only groups before publication and appends them after ordinary
  learner groups once feedback is available.
- `isReviewerFeedbackContext` is passed explicitly to question components. Do not infer this only
  from `question.reviewerOnly`. It suppresses redundant ownership labels for published learner
  feedback and completed reviewer views, while shared groups and pending review authoring retain
  their labels.
- Pending reviewers see one neutral **Reviewer-only questions** guidance callout at the start of
  each contiguous reviewer-only section, including when pagination begins within that section.
- Empty reviewer arrays, strings, and objects use the neutral **No answer for this question** state.

### choice questions

- `app-multiple` collects learner and reviewer answer ids, including stringified or nested payloads,
  and filters configured choices to the selected union.
- `app-oneof` remains selected-only and renders both selected rows when learner and reviewer chose
  different values.
- In shared-question read-only views, ownership chips in choice and team-member selector questions
  render before the selected answer content, matching the text and file question layout.
- Reviewer-only team selectors filter their read-only list to reviewer-selected members.
- Selection inputs remain unchanged during learner and reviewer authoring.

### other reviewer-only answers

- Text and file/video responses render their content without a reviewer ownership chip.
- Sliders use the review answer as the disabled scale value without a reviewer ownership chip.
- Genuine content labels such as **Feedback** remain visible.

## verification

- Assessment tests cover reviewer-only visibility, ordering, pagination, authoring guidance,
  context, and empty answers.
- Choice component tests cover selected unions, shared selections, reviewer-only selections, and
  learner/reviewer ownership labels.
- Text, slider, file/video, and selector checks cover contextual ownership suppression in published
  learner feedback and completed reviewer views.
