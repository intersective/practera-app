---
id: shared-infrastructure
kind: capability
title: "Shared Infrastructure & Utilities"
parent: system
value: "Provides foundational services for API communication, file handling, media processing, analytics integration, and UI utilities used across all capabilities."
status: active
sources:
  - "projects/v3/src/app/services/apollo.service.ts"
  - "projects/v3/src/app/services/network.service.ts"
  - "projects/v3/src/app/services/shared.service.ts"
  - "projects/v3/src/app/services/modal.service.ts"
  - "projects/v3/src/app/services/utils.service.ts"
  - "projects/v3/src/app/services/animations.service.ts"
  - "projects/v3/src/app/services/file-preview.service.ts"
  - "projects/v3/src/app/services/ffmpeg.service.ts"
  - "projects/v3/src/app/services/ngx-embed-video.service.ts"
  - "projects/v3/src/app/services/hubspot.service.ts"
  - "projects/v3/src/app/services/taxonomy.service.ts"
  - "projects/v3/src/app/services/request.interceptor.ts"
  - "projects/v3/src/app/services/types.ts"
  - "projects/v3/src/app/services/component-cleanup.service.ts"
  - "projects/v3/src/app/services/demo.service.ts"
  - "projects/v3/src/app/services/version-check.service.ts"
  - "projects/v3/src/app/components/uppy-uploader/**"
  - "projects/v3/src/app/components/file-preview/**"
  - "projects/v3/src/app/components/file-popup/**"
  - "projects/v3/src/app/components/video-conversion/**"
  - "projects/v3/src/app/components/pop-up/**"
  - "projects/v3/src/app/components/description/**"
  - "projects/v3/src/app/components/circle-progress/**"
  - "projects/v3/src/app/components/img/**"
  - "projects/v3/src/app/components/list-item/**"
  - "projects/v3/src/app/components/bottom-action-bar/**"
  - "projects/v3/src/app/components/team-member-selector/**"
  - "projects/v3/src/app/components/multi-team-member-selector/**"
  - "projects/v3/src/app/components/team-roster/**"
  - "projects/v3/src/app/components/project-brief-modal/**"
  - "projects/v3/src/app/components/lock-team-assessment-pop-up/**"
  - "projects/v3/src/app/components/activity-complete-pop-up/**"
  - "projects/v3/src/app/components/time-log/**"
  - "projects/v3/src/app/directives/**"
  - "projects/v3/src/app/guards/**"
  - "projects/v3/src/app/models/**"
  - "projects/v3/src/app/pipes/**"
  - "projects/v3/src/app/personalised-header/**"
  - "projects/v3/src/app/pages/devtool/**"
  - "projects/v3/src/app/pages/page-not-found/**"
  - "projects/v3/src/app/services/project-brief-pdf.service.ts"
tests:
  - "projects/v3/src/app/services/apollo.service.spec.ts"
  - "projects/v3/src/app/services/network.service.spec.ts"
  - "projects/v3/src/app/services/shared.service.spec.ts"
  - "projects/v3/src/app/services/modal.service.spec.ts"
  - "projects/v3/src/app/services/utils.service.spec.ts"
  - "projects/v3/src/app/services/animations.service.spec.ts"
  - "projects/v3/src/app/services/ffmpeg.service.spec.ts"
  - "projects/v3/src/app/services/ngx-embed-video.service.spec.ts"
  - "projects/v3/src/app/services/hubspot.service.spec.ts"
  - "projects/v3/src/app/services/taxonomy.service.spec.ts"
  - "projects/v3/src/app/services/request.interceptor.spec.ts"
  - "projects/v3/src/app/services/project-brief-pdf.service.spec.ts"
  - "projects/v3/src/app/components/uppy-uploader/**/*.spec.ts"
  - "projects/v3/src/app/components/file-preview/**/*.spec.ts"
  - "projects/v3/src/app/components/file-popup/**/*.spec.ts"
  - "projects/v3/src/app/components/video-conversion/**/*.spec.ts"
  - "projects/v3/src/app/components/pop-up/**/*.spec.ts"
  - "projects/v3/src/app/components/description/**/*.spec.ts"
  - "projects/v3/src/app/components/circle-progress/**/*.spec.ts"
  - "projects/v3/src/app/components/img/**/*.spec.ts"
  - "projects/v3/src/app/components/list-item/**/*.spec.ts"
  - "projects/v3/src/app/components/bottom-action-bar/**/*.spec.ts"
  - "projects/v3/src/app/components/team-member-selector/**/*.spec.ts"
  - "projects/v3/src/app/components/multi-team-member-selector/**/*.spec.ts"
  - "projects/v3/src/app/components/team-roster/**/*.spec.ts"
  - "projects/v3/src/app/components/project-brief-modal/**/*.spec.ts"
  - "projects/v3/src/app/components/lock-team-assessment-pop-up/**/*.spec.ts"
  - "projects/v3/src/app/components/activity-complete-pop-up/**/*.spec.ts"
  - "projects/v3/src/app/components/time-log/**/*.spec.ts"
  - "projects/v3/src/app/directives/**/*.spec.ts"
  - "projects/v3/src/app/guards/**/*.spec.ts"
  - "projects/v3/src/app/models/**/*.spec.ts"
  - "projects/v3/src/app/pipes/**/*.spec.ts"
  - "projects/v3/src/app/personalised-header/**/*.spec.ts"
  - "projects/v3/src/app/app.component.spec.ts"
  - "projects/v3/src/testing/**/*.spec.ts"
---

# Shared Infrastructure & Utilities

## Problem & Value

The Practera Learner App requires a stable, reusable foundation to handle cross-cutting concerns such as API communication, file handling, network connectivity monitoring, modal dialogs, animations, and media processing. Without these shared infrastructure services, every capability would need to reinvent low-level plumbing, leading to inconsistency, duplication, and fragile integrations. This capability centralizes foundational utilities—Apollo GraphQL clients, HTTP request interceptors, storage services, file preview, video transcoding via FFmpeg, version checking, modal queue management, and routing for error pages—so that higher-level capabilities can focus on delivering learner and business value. Teams building assessments, chat, or activity features rely on these services for authentication headers, file uploads, offline detection, and smooth UI transitions.

## Users & Journeys

- A learner uploads a video assessment response; the app uses FFmpeg to transcode it to MP4 for cross-platform playback.
- A learner opens a PDF attachment in a chat message; the file preview service displays it in a modal without leaving the conversation.
- A learner loses network connectivity; the network service detects the offline state and prevents API calls until reconnection.
- An administrator deploys a new app version; the version-check service polls version.json every 3 minutes and logs the user out when a hash change is detected.
- A learner navigates to a broken route; the page-not-found component displays a 'Page Not Found' message with a button to return home.
- A developer uses the devtool page to inspect internal state and trigger diagnostic actions during local development.

## Requirements

- [ ] The network service exposes an observable that emits true when the browser is online and the server is reachable, and false otherwise, checking server reachability when navigator.onLine is false. <!-- claim: network-status-observable -->
- [ ] The request interceptor adds appkey, apikey, timelineId, and teamId headers to outgoing HTTP requests, except for ipapi.co and api.hsforms.com, and refreshes the stored apikey when the API returns a new JWT in the response body. <!-- claim: request-headers-injected -->
- [ ] The modal service queues modal configurations and shows them one at a time, preventing duplicate modals with the same modalId from being added to the queue or displayed simultaneously. <!-- claim: modal-queue-prevents-duplicates -->
- [ ] The FFmpeg service loads the FFmpeg WASM core and worker from local assets, writes an input video file, transcodes it to MP4 using the exec method, and returns a Blob of the output video. <!-- claim: ffmpeg-transcoding -->
- [ ] The file preview service opens a modal displaying the file URL, warns the user if a non-image, non-PDF, non-Office document exceeds 10 MB, and offers a download button instead of inline preview. <!-- claim: file-preview-modal-opens -->
- [ ] The version check service polls version.json every 3 minutes, compares the hash against the build-time hash, and navigates to the logout route with a timestamp if the hash has changed. <!-- claim: version-check-logout -->
- [ ] The page-not-found component displays a 'Page Not Found' heading and a 'Go Home' button that navigates to /v3/home with replaceUrl set to true, and sets the page title to 'Page Not Found - Practera'. <!-- claim: page-not-found-navigation -->
- [ ] The animations service provides an enterAnimation that slides the modal wrapper from 200% translateX to 0 and fades in the backdrop, and a leaveAnimation that reverses the enter animation. <!-- claim: animation-enter-leave -->
- [ ] The component cleanup service exposes a cleanup$ observable and a triggerCleanup method to emit cleanup events for subscribed components. <!-- claim: component-cleanup-observable -->
- [ ] The devtool module lazy-loads the DevtoolPage component at the devtool route, accessible only in development builds. <!-- claim: devtool-page-routing -->
- [ ] The types module exports a Response interface with success boolean and message string fields, used by services to return operation results. <!-- claim: response-interface -->
- [ ] The network service checks server reachability by sending a GET request to https://practera.com and mapping a 200 status to true, or false on error. <!-- claim: server-reachability-check -->
- [ ] The modal service executes an optional callback function after a modal is dismissed, removes the modalId from the active set, and triggers the next queued modal. <!-- claim: modal-callback-execution -->
- [ ] The file preview service determines whether a file is an image, PDF, or Office document by inspecting the mimetype or type field and the URL extension, applying size warnings only to non-previewable application files. <!-- claim: file-preview-mime-detection -->
- [ ] The version check service retries the version.json request up to 5 times with a 1-second delay if an error occurs, ignoring cache by appending a timestamp and setting Cache-Control headers. <!-- claim: version-check-retry -->

## Scenarios

### Scenario 1: Learner uploads a large video and it is transcoded
**Steps:**
1. Learner selects a .avi video file in an assessment submission form.
2. The file upload component calls the FFmpeg service to transcode the video.
3. The FFmpeg service loads the WASM core, writes input.avi, runs ffmpeg -i input.avi output.mp4, and reads the output file.

**Expected Results:**
- The FFmpeg service returns a Blob of type video/mp4.
- The upload component uploads the transcoded MP4 to the server.

### Scenario 2: Learner previews a PDF attachment
**Steps:**
1. Learner taps a PDF file link in a chat message.
2. The file preview service checks the file's mimetype and URL.
3. The service opens a modal with FilePreviewComponent, passing the file URL and metadata.

**Expected Results:**
- A modal displaying the PDF inline appears.
- The modal shows a close button and the file name.

### Scenario 3: App detects network offline and reconnects
**Steps:**
1. Learner's device loses Wi-Fi connectivity.
2. The network service listens to the 'offline' event and checks server reachability.
3. The network service emits false on the isOnline observable.
4. The device reconnects to Wi-Fi and the browser fires the 'online' event.

**Expected Results:**
- The network service emits false when offline.
- The network service emits true when the browser and server are reachable again.

### Scenario 4: New version deployed and user is logged out
**Steps:**
1. The version check service polls version.json every 3 minutes.
2. The server returns a new hash value different from the build-time hash.
3. The version check service detects the hash change.

**Expected Results:**
- The service navigates to /logout with a timestamp query parameter.
- The user is logged out and must re-authenticate.

### Scenario 5: Learner navigates to an invalid route
**Steps:**
1. Learner enters an unrecognized URL path in the browser.
2. The router resolves the route to the page-not-found component.
3. The component calls utils.setPageTitle and storage.lastVisited with null.

**Expected Results:**
- The page displays 'Page Not Found' and a 'Go Home' button.
- Clicking 'Go Home' navigates to /v3/home and replaces the history entry.

### Scenario 6: Duplicate modal suppressed by modalId
**Steps:**
1. A service calls modalService.addModal with modalId 'assessment-complete'.
2. Before the modal is dismissed, the same service calls addModal again with the same modalId.

**Expected Results:**
- The modal service checks activeModalIds and ignores the duplicate request.
- Only one 'assessment-complete' modal is shown.

### Scenario 7: Request interceptor refreshes apikey
**Steps:**
1. The user is authenticated with an apikey JWT.
2. The app makes an API request to submit an activity.
3. The API response includes data.auth.apikey with a new JWT value.

**Expected Results:**
- The request interceptor detects the new apikey in the response.
- The storage service updates the user's apikey to the new value.
- Subsequent requests use the refreshed apikey in the apikey header.

### Scenario 8: Large file download offered instead of preview
**Steps:**
1. Learner taps a 15 MB .zip file attachment.
2. The file preview service checks the file size and mimetype.
3. The service calculates the size exceeds 10 MB and the type is application/.

**Expected Results:**
- An alert appears with message 'Attachment size has exceeded the size of 15mb…'.
- The alert has a 'Download' button that opens the file URL in a new tab, and a 'Cancel' button.

## Security & Data Considerations

The request interceptor injects apikey (JWT), timelineId, and teamId headers into authenticated API calls, trusting the storage service to hold valid credentials. The version check service compares build-time hashes to detect unauthorized or outdated frontend code, logging users out to force a refresh. The file preview service opens external URLs in modals without additional validation, trusting the backend to serve only authorized file URLs. The network service makes unauthenticated GET requests to https://practera.com to check reachability. No user input is sanitized at this layer; that responsibility lies with higher-level capabilities. The modal service does not enforce authorization on which modals can be shown. Data touched: user credentials (apikey, timelineId, teamId), file URLs, version hashes.

## Interfaces

HTTP Interceptor: appkey, apikey, timelineId, teamId headers added to all non-excluded requests. Observable: NetworkService.isOnline emits boolean. Method: ModalService.addModal(modalConfig, callback?, modalId?) queues a modal. Method: FilePreviewService.preview(file) and openModal(url, file?) open file preview modals. Method: FfmpegService.loadFFmpeg() and transcode(videoURL) process video files. Method: VersionCheckService.initiateVersionCheck(frequency) polls version.json. Route: /v3/page-not-found displays 404 page. Route: /v3/devtool displays developer tools. Observable: ComponentCleanupService.cleanup$ emits cleanup events. Interface: Response { success: boolean; message: string }.

## Out of Scope

This capability does not handle user authentication or session management beyond header injection; login and logout flows are owned by the authentication capability. It does not manage file uploads or storage beyond local transcoding and preview; the file storage capability handles S3/Filestack integration. It does not implement specific business logic for assessments, chat, or activities; those are separate capabilities. The devtool page is for development only and is not part of production functionality. The modal service does not implement specific modal content; components pass their own content and configuration. The network service does not retry failed API requests; that is the responsibility of calling services. The version check service does not display UI for version updates; it silently logs the user out. FFmpeg configuration (bitrate, resolution) is hardcoded in this service and not user-configurable.
