---
status: stable
authority: reference
scope: v3
last_reviewed: 2026-08-12
supersedes: none
---

# CORE-8316: Immediate Message Attachment Preview

## Failure

When a user sent an attachment, another user in the same chat received the new
message immediately through Pusher but could not render or preview the file
until reloading the page.

The uploader provides the canonical CDN path immediately after upload. The
`createChatLog` mutation then returns the stored file with an authorized URL.
The sender rendered that API response, but the Pusher event used the original
uploader object instead. Recipients therefore received the canonical path
without the authorization query parameters required to load the file.

Reloading appeared to fix the problem because `getMessageList()` fetched the
message through GraphQL, which returned an authorized file URL.

## Required real-time contract

After `createChatLog` succeeds, all local rendering and real-time delivery must
use the mutation response as the source of truth:

- `response.file` is added to the sender's message list.
- `response.file` is included in the `client-chat-new-message` event.
- The pre-mutation uploader object is used only as the mutation input.

The Pusher attachment payload is either `null` or an object containing `name`,
`type`, and the API-returned `url`.

## Pre-send preview contract

The composer must display a newly uploaded image before the message is sent.
At this point the canonical CDN URL may not be immediately readable, so the
selected attachment uses this fallback order only for its temporary preview:

1. `directUrl`
2. canonical `url`
3. TUS `uploadUrl`

The message mutation continues to receive the canonical `url`; the direct URL
must not replace the value persisted with the chat message.

Both the inline composer thumbnail and the preview modal render the temporary
`preview` URL. The modal download action continues to use the canonical `url`.

## Verification

Automated coverage sends an attachment with an unsigned uploader URL while the
mocked message API returns a signed URL. It verifies that the Pusher event uses
the API-returned file and never the uploader object. Separate coverage verifies
that a selected attachment previews `directUrl` while retaining the canonical
URL for the outgoing message. The preview modal coverage also verifies that its
rendered media uses the immediate preview URL and falls back to the canonical
URL for attachments that have already been sent.

For staging verification, keep two users in the same direct-message channel,
send an image from one browser, and open it immediately in the receiving
browser without reloading. Both the inline image and preview modal must render.
