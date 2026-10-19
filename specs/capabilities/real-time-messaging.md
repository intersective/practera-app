---
id: real-time-messaging
kind: capability
title: "Real-Time Messaging & Collaboration"
parent: system
value: "Connects learners with peers, mentors, and coordinators through real-time chat with channels, direct messages, threads, file attachments, and message editing."
status: active
sources:
  - "projects/v3/src/app/pages/chat/**"
  - "projects/v3/src/app/services/chat.service.ts"
  - "projects/v3/src/app/services/pusher.service.ts"
tests:
  - "projects/v3/src/app/pages/chat/**/*.spec.ts"
  - "projects/v3/src/app/services/chat.service.spec.ts"
  - "projects/v3/src/app/services/pusher.service.spec.ts"
---

# Real-Time Messaging & Collaboration

## Problem & Value

Learners in work-integrated learning programs need to communicate with peers, mentors, and coordinators to collaborate on projects, receive guidance, and stay informed about announcements. Without real-time messaging, learners face delays in getting support, miss critical updates, and struggle to coordinate group activities. This capability delivers instant, contextual communication through channels, direct messages, and threads, ensuring learners stay connected and engaged throughout their learning journey. By supporting rich media attachments, message editing, and mobile-optimized interfaces, the system enables effective collaboration regardless of device or location.

## Users & Journeys

- A learner opens the Messages page to view all available channels including announcements, group chats, and direct messages with unread counts visible.
- A learner selects a group channel, scrolls to load older message history, then sends a text message with formatting and an attached image.
- A mentor posts an announcement to a channel that all enrolled learners immediately see without refreshing.
- A learner edits a previously sent message to correct a typo, and the updated message appears to all participants.
- A coordinator opens channel details to view the member list with roles displayed for mentors and coordinators.
- A learner opens a video attachment preview, watches the video inline, then downloads it to their device.

## Requirements

- [ ] The Messages page displays a list of channels including announcements, group channels, and direct messages accessible to the authenticated learner. <!-- claim: channel-list-display -->
- [ ] Each channel in the list shows an unread message count when new messages have arrived since the learner last viewed that channel. <!-- claim: unread-message-counts -->
- [ ] Opening a chat room loads recent message history with older messages loaded on demand when the learner scrolls upward. <!-- claim: paginated-message-history -->
- [ ] Learners can compose and send messages containing bold, italic, underline, strike-through formatting, lists, and hyperlinks that are automatically detected. <!-- claim: send-rich-text-messages -->
- [ ] Learners can edit their own previously sent messages; the updated message content replaces the original and is visible to all channel participants. <!-- claim: edit-own-messages -->
- [ ] New messages posted to a channel appear in all participants' chat rooms in real-time via Pusher without requiring a page refresh. <!-- claim: real-time-message-delivery -->
- [ ] Learners can attach and send files, photos, and videos by selecting the attachment type (file, photo, or video) and uploading content which is then embedded in the message. <!-- claim: file-attachments -->
- [ ] A chat preview component displays a compact view of channel information before the full chat room is opened. <!-- claim: compact-chat-preview -->
- [ ] On desktop viewports, the interface displays a two-column layout with the channel list on the left and the active chat room or channel details on the right. <!-- claim: desktop-split-view -->
- [ ] On mobile viewports, the channel list and chat room each occupy the full screen with navigation between them. <!-- claim: mobile-full-screen -->
- [ ] Learners can open a channel details panel displaying the channel name, announcement badge if applicable, and a list of members with their names, avatars, and roles. <!-- claim: channel-details-panel -->
- [ ] In the channel details member list, roles such as mentor and coordinator are displayed next to member names, while participant and admin roles are not labeled. <!-- claim: member-role-labels -->
- [ ] Attachments of type image or browser-supported video (mp4, webm, ogg) can be previewed inline in a modal with download and close controls. <!-- claim: image-video-preview -->
- [ ] Video files in formats not natively supported by the browser display a message indicating preview is unavailable with a download link provided. <!-- claim: unsupported-video-handling -->
- [ ] The edit message modal presents a rich text editor pre-populated with the original message content, an update button that submits changes, and a success confirmation screen after update. <!-- claim: edit-message-modal -->
- [ ] The attachment popover presents three options: File (any type), Photos (image), and Videos (video), each opening an uploader filtered to the selected media type. <!-- claim: attachment-type-selection -->
- [ ] On desktop when the chat view loads, the first available channel is automatically selected and displayed in the chat room pane if no channel is already selected. <!-- claim: first-channel-auto-select -->
- [ ] Preview and close controls in the attachment preview modal respond to keyboard events including Space and Enter key presses for accessibility. <!-- claim: keyboard-navigation -->

## Scenarios

### Scenario 1: Send a message with attachment
**Steps:**
1. Learner opens the Messages page and selects a group channel from the list
2. Learner clicks the attachment icon and chooses 'Photos' from the popover
3. Learner uploads an image file which is attached to the message
4. Learner types a message with bold formatting in the rich text editor
5. Learner submits the message

**Expected Results:**
- The message with formatted text and image attachment appears in the chat room
- All channel participants receive the message in real-time via Pusher
- The attached image displays inline and can be clicked to preview

### Scenario 2: Load older message history
**Steps:**
1. Learner opens a chat room that contains many historical messages
2. The chat room initially displays recent messages
3. Learner scrolls upward toward the top of the message list

**Expected Results:**
- Older messages are loaded and displayed as the learner scrolls
- Message history pagination continues until the earliest messages are reached
- The scroll position is maintained as new older messages are inserted

### Scenario 3: Edit a sent message
**Steps:**
1. Learner locates a message they previously sent in a chat room
2. Learner clicks the edit option for that message
3. The edit message modal opens with a rich text editor showing the original message content
4. Learner modifies the text and clicks 'Update Message'

**Expected Results:**
- The modal displays a success confirmation with the updated message preview
- The edited message replaces the original in the chat room for all participants
- The modal can be closed after the update completes

### Scenario 4: View channel details and members
**Steps:**
1. Learner opens a group channel in the chat room
2. Learner clicks the channel info icon or button
3. The channel details panel loads and displays

**Expected Results:**
- The panel shows the channel name and an 'Announcement' badge if the channel is an announcement channel
- A member list displays all participants with names, avatars, and role labels for mentors and coordinators
- The member count is shown as a heading above the list
- A close button dismisses the panel and returns to the chat room

### Scenario 5: Preview and download video attachment
**Steps:**
1. Learner receives a message containing a video attachment in mp4 format
2. Learner clicks the video attachment to preview it

**Expected Results:**
- A modal opens displaying the video with inline playback controls
- The video can be played, paused, and scrubbed within the modal
- A download button allows the learner to save the video file
- If the video format is unsupported, a message with a download link is shown instead
- Closing the modal returns to the chat room

### Scenario 6: Real-time message reception
**Steps:**
1. Learner has a chat room open for a group channel
2. Another participant posts a new message to the same channel

**Expected Results:**
- The new message appears in the learner's chat room immediately without refresh
- The channel list updates the unread count if the learner is viewing a different channel
- Pusher delivers the message event triggering the UI update

### Scenario 7: Desktop split-view navigation
**Steps:**
1. Learner opens the Messages page on a desktop browser
2. The channel list appears on the left with the first channel auto-selected
3. The first channel's chat room displays on the right
4. Learner clicks a different channel in the list

**Expected Results:**
- The right pane updates to show the selected channel's chat room
- The channel list remains visible on the left
- Clicking the channel info icon replaces the chat room with the channel details panel
- Closing the details panel returns to the chat room view

### Scenario 8: Mobile full-screen navigation
**Steps:**
1. Learner opens the Messages page on a mobile device
2. The full-screen channel list is displayed
3. Learner taps a channel in the list

**Expected Results:**
- The app navigates to a full-screen chat room for the selected channel
- A back button or gesture returns to the channel list
- The chat room occupies the entire viewport for optimal mobile reading and composition

## Security & Data Considerations

The capability handles user-generated message content and file attachments uploaded by learners. Messages are sent to and received from a backend API with authentication managed by AuthService. Attachments are uploaded via an uploader service to cloud storage (bucket and path fields indicate S3 or similar). Trust boundaries include: (1) message content rendered via Quill editor which must sanitize HTML to prevent XSS; (2) file uploads validated by type and potentially scanned for malware; (3) Pusher real-time events authenticated to prevent message spoofing. Access control ensures learners can only view channels they are members of and edit only their own messages. Abuse cases include: posting malicious links or scripts in messages, uploading executable files disguised as media, flooding channels with spam, and attempting to edit or delete others' messages. The QuillViewHtml component uses sanitize=true to mitigate stored XSS. Video playback errors are logged but do not expose sensitive error details to the UI.

## Interfaces

Routes: /app/chat (ChatPage with nested ChatViewComponent), /app/chat/chat-room (ChatRoomComponent). The chat.service.ts provides methods including editChatMessage(EditMessageParam) which accepts { uuid, message } and returns an observable. Pusher.service.ts manages Pusher subscriptions for real-time message events. The ChatChannel type includes fields: name, isAnnouncement, and member list. The Message type includes fields: uuid, message (HTML string), and metadata. The AttachmentPopoverComponent emits selectedFile objects with { url, filename, mimetype, size, path, bucket }. The EditMessagePopupComponent accepts a Message input and dismisses with { updateSuccess, newMessageData }. The ChatPreviewComponent accepts a file input with { type, preview, url } and provides download and close actions. The uppy-uploader.service opens a modal filtered by media type ('any', 'image', 'video') and returns uploaded file metadata on dismissal.

## Out of Scope

This capability does not cover push notifications or email alerts for new messages outside the app. It does not include message search, filtering, or archiving features. Typing indicators, read receipts, and online presence status are not implemented. Administrative functions such as creating channels, inviting members, or moderating content are not part of this capability. Message deletion (hard delete) is not supported; only editing is allowed. The capability does not handle voice or video calls, screen sharing, or emoji reactions. Message threading (replies to specific messages) is referenced in file names (thread-panel.component) but not detailed in the provided material, so thread functionality is out of scope for this spec. The capability does not enforce message retention policies or provide audit logs of edits.
