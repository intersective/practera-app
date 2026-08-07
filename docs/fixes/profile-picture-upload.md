---
status: stable
authority: reference
scope: v3
last_reviewed: 2026-08-06
supersedes: none
---

# Profile Picture Upload

## Failure

The settings page uploaded the image successfully but could send an invalid `FileInput` to the `updateUserProfile` mutation. The upload modal read the TUS response as if it contained `url`, while the upload service returns `cdnUrl`. It therefore dismissed the modal with an undefined `url`, and the settings page replaced that value with the resumable TUS `uploadUrl`. That URL is an upload-session location, not the public image URL expected by the profile API.

The settings page also ignored the mutation result. A response such as `{ success: false, message: "avatar file object incorrect" }` still updated local state and displayed the success alert.

`AuthService.updateUserProfile()` also passed the mutation document to `graphQLFetch()`, which executes `Apollo.query()`. Apollo rejected the request locally with `Running a query requires a graphql query, but a mutation was used instead`, before it could reach the profile resolver. Profile updates must use `graphQLMutate()` with `{ avatar }` as the variables object.

## Upload response contract

The final TUS `PATCH` response must have a JSON body containing non-empty values for:

```json
{
  "bucket": "profile-images",
  "path": "/users/profile.png",
  "cdnUrl": "https://cdn.example.com/users/profile.png",
  "directUrl": "https://files.example.com/users/profile.png"
}
```

`UppyUploaderService.parseTusUploadResponse()` is the shared validator used by the modal uploader and assessment file uploader. Empty, malformed, or incomplete response bodies stop the upload flow with a specific user-visible error.

The modal normalizes the response to `UppyFileData` and preserves both `cdnUrl` and `directUrl`. Assessment answers persist the canonical CDN URL but prefer `directUrl || url` for immediate display. Profile avatars follow the same display preference and persist `directUrl` when it is available because the `user-profile` CDN URL may not be directly readable; they fall back to the canonical `url`. Consumers must never use `file.tus.uploadUrl` as stored file metadata.

## Profile update behavior

`SettingsPage.profileImage()` sends the normalized file fields to `AuthService.updateUserProfile()`:

- `bucket`
- `path`
- `name`
- `url` (`directUrl` when available, otherwise the CDN URL)
- `extension`
- `type`
- `size`

The page updates its avatar and browser storage only when `data.updateUserProfile.success` is exactly `true`. A missing result or `success: false` displays the returned message and leaves the previous avatar unchanged. The upload spinner is cleared for success, cancellation, and error paths.

The `user-profile` upload source is image-only.

## Verification and rollout

Automated coverage verifies TUS response validation, assessment uploader integration, image-only profile restrictions, direct-URL preference, successful profile payloads, and rejected mutations.

After deployment, verify one successful PNG/JPEG upload and one rejected/invalid upload in staging. Monitor upload endpoint errors and `updateUserProfile` failures separately. Logs should include the request/correlation identifier, upload source, HTTP status, and a stable error category such as `empty_upload_response`, `invalid_upload_metadata`, or `profile_update_rejected`; they must not include file bytes, API keys, or full signed URLs.
