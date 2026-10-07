# H5P player

<!-- module: app-v3/components/h5p-player / type: component / status: draft / feature: deliver.content.h5p -->

## Overview

`H5pPlayerComponent` plays an H5P package inside a topic or assessment task. It loads `h5p-standalone` with the package's content URL, frame script, frame stylesheet and libraries URL. xAPI statements posted by the player are forwarded for storage, and a completed or answered statement also fires `h5pTaskCompleted` for the page.

## Acceptance Criteria

1. A missing `contentUrl` shows "Failed to load H5P content." and does not mount the player.
2. A package that fails to load shows the same error and leaves the player unloaded.
3. A loaded package listens for xAPI `postMessage` payloads. A payload with a verb is re-posted as `h5pXapiStatements`, carrying the statement, `taskId`, `assessmentId` and `activitySource: 'h5p'`.
4. A verb of `completed` or `answered` also dispatches `h5pTaskCompleted` with the task id, context id and raw score.
5. A malformed message is ignored. The listener is removed when the component is destroyed.

## Scenarios

### Scenario 1: Learner finishes an H5P task

**Steps:**
1. Open a task whose content is an H5P package.
2. Complete the activity so the player posts an xAPI `completed` statement.

**Expected Results:**
- The statement is forwarded for storage.
- The task page receives `h5pTaskCompleted` with that task's id.
