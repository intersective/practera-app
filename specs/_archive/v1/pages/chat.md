# Chat Page

<!-- module: app-v3/pages/chat / type: page / status: draft / feature: deliver.chat.file-attachments, deliver.chat.learner, deliver.chat.reactions, deliver.chat.threads, deliver.teams.learner-roster -->

## Overview

The chat page provides the learner's real-time messaging interface, powered by Pusher. It includes a channel list (announcements, group channels, DMs), a chat room with paginated messages and rich compose, and a channel info panel. Learners can edit their own messages. New messages are received in real-time via Pusher.

## Acceptance Criteria

- **AC1**: Channel list shows announcements, group channels, and direct messages for the learner.
- **AC2**: Unread message count is shown per channel.
- **AC3**: Chat room loads paginated message history (older messages loaded on scroll).
- **AC4**: Learner can send messages with rich text (links, formatting).
- **AC5**: Learner can edit their own messages (edit-message popup).
- **AC6**: New messages appear in real-time via Pusher without page refresh.
- **AC7**: Attachments (images, files) can be sent via the attachment popover.
- **AC8**: Chat preview is shown in a compact view before opening the full room.

## Scenarios

### Scenario 1: Send Message
**Steps:**
1. Learner opens a chat channel.
2. Types a message in the compose area.
3. Sends the message.

**Expected Results:**
- Message appears in the chat room immediately.
- Other participants receive the message in real-time via Pusher.
- Unread count resets for the sender.

### Scenario 2: Load Message History
**Steps:**
1. Learner opens a chat room with many messages.
2. Scrolls to the top.

**Expected Results:**
- Older messages are loaded (pagination).
- New messages do not cause scroll position reset.

### Scenario 3: Edit Own Message
**Steps:**
1. Learner taps on their own message.
2. Selects edit.
3. Modifies the text.
4. Saves.

**Expected Results:**
- Message updated in the chat room.
- "Edited" indicator shown on the message.
