# Notification and real-time refresh after switching experiences

## Problem

`NotificationsService` is provided at the application root and replays its latest notification list. Ionic can retain the v3 page while the user visits the experience list, so returning to the dashboard does not necessarily recreate `V3Page` or rerun its initialization. Without an explicit refresh, the notification badge and list can therefore remain scoped to the previously selected project.

## Required behavior

- Notification state is scoped to the current user's `projectId`.
- Changing projects immediately clears the cached todo list and replayed event reminder.
- Todo items load before chat notifications because chat is appended to the freshly loaded todo list.
- Experience selection waits for this refresh before leaving the loading state.
- A notification refresh failure must not undo a successful experience switch. The new experience opens with an empty notification state rather than exposing notifications from the previous project.
- Responses from requests started under a previous project are ignored if they arrive after the active project changes.
- Pusher listeners are also experience-scoped. The application reuses one Pusher client, but disconnects its socket briefly on a scope change so pending private channels can be removed safely before reconnecting with the new channel set.

## Refresh entry points

- `V3Page` refreshes notifications when it is first initialized.
- `ExperiencesPage` refreshes notifications after authentication has switched to the selected experience and before navigating to the destination route.
- `ExperienceService` reinitializes web services after the selected experience's authentication response is available. `PusherService` detects scope changes using the program, project, and timeline identifiers, removes the previous listeners, refreshes authorization, and reconciles notification and chat subscriptions with the latest channel responses.
- `V3Page` also initializes web services as a fallback for authenticated login paths. App startup covers restored sessions, and direct login waits for initialization before navigating to deep links outside v3.
- Pusher initialization is single-flight. Concurrent entry points share one operation, and a scope that changes during that operation is reconciled before callers are released.
- Notification and chat discovery use independent generations. Only the latest response for the active scope may change listeners, preventing both previous-experience and same-experience request races.
- A valid empty channel response removes that listener type. Pusher v4 leaves authorization failures in a pending state, so reconciliation disconnects before removing a pending channel; this ensures the channel is removed from Pusher's internal registry and cannot return on a later reconnect. A discovery failure preserves the last valid same-scope set, while a scope change remains empty because its previous listeners were removed before discovery.
- Pusher authorization headers are synchronized from user storage before channel subscription and connection retries. API-key rotation therefore does not require constructing another Pusher client.
- Private-channel subscription errors trigger one bounded background retry. Same-scope discovery does not cancel an outstanding retry, and simultaneous notification/chat failures are batched into one socket reconnect. Repeated failure is logged and never blocks navigation.
- Event callbacks capture their subscription scope and discard events after that scope becomes inactive.

Both notification-refresh entry points use `NotificationsService.refreshNotifications()` so the reset and request ordering remain consistent.

## Listener ownership and cleanup

- `PusherService` is the only owner of Pusher channel subscriptions. Chat pages request `refreshChatChannels()` rather than subscribing to channel names directly.
- `TabsPage` remains the adapter from real-time notification, chat, and reminder events into `NotificationsService` state.
- V3, tabs, chat-list, and chat-room consumers release their event-stream subscriptions when destroyed. Chat-room typing listeners are replaced when the active room changes.
- Logout invalidates in-flight initialization and discovery work, resets generations and retry timers, disconnects the socket, removes all local channels, clears the active scope and authorization headers, and retains only the reusable application Pusher object.

## Deferred improvements

- Upgrade the legacy Pusher client and separate typings in a dedicated compatibility change.
- Replace the string-keyed application event bus with typed real-time events.
- Add structured production telemetry for connection state, authorization errors, retries, and notification refresh failures.
- Revisit persistent capped retry backoff only if production telemetry shows the bounded retry is insufficient.
