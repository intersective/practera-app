---
status: stable
authority: reference
scope: v3
last_reviewed: 2026-10-02
supersedes: none
---

# Profile Picture Upload

## Failure

The settings page uploaded the image successfully but could send an invalid `FileInput` to the `updateUserProfile` mutation. The upload modal read the TUS response as if it contained `url`, while the upload service returns `cdnUrl`. It therefore dismissed the modal with an undefined `url`, and the settings page replaced that value with the resumable TUS `uploadUrl`. That URL is an upload-session location, not the public image URL expected by the profile API.

The settings page also ignored the mutation result. A response such as `{ success: false, message: "avatar file object incorrect" }` still updated local state and displayed the success alert.

`AuthService.updateUserProfile()` also passed the mutation document to `graphQLFetch()`, which executes `Apollo.query()`. Apollo rejected the request locally with `Running a query requires a graphql query, but a mutation was used instead`, before it could reach the profile resolver. Profile updates must use `graphQLMutate()` with `{ avatar }` as the variables object.

## Upload response contract

A completed TUS `PATCH` response, or `POST` for a zero-byte file, has a JSON body containing non-empty values for:

```json
{
  "bucket": "profile-images",
  "path": "/users/profile.png",
  "cdnUrl": "https://cdn.example.com/users/profile.png",
  "directUrl": "https://files.example.com/users/profile.png"
}
```

Completed-upload `HEAD` responses return that same JSON in the CORS-exposed `Upload-Result` header. The completion-metadata server change must be deployed before this resume-recovery path is available. Incomplete `HEAD` and intermediate `PATCH` responses need no completion metadata. The app leaves non-success HTTP responses to tus-js-client so authentication and source errors retain their HTTP status.

`UppyUploaderService.parseTusUploadResponse()` is the shared validator used by the modal uploader and assessment file uploader. Empty, malformed, or incomplete response bodies stop the upload flow with a specific user-visible error.

The modal normalizes the response to `UppyFileData` and preserves both `cdnUrl` and `directUrl`. Profile avatars persist and display the canonical `cdnUrl` (or the normalized `url` alias). The sandbox CDN supports anonymous avatar image requests; the TUS `directUrl` requires authentication headers that an ordinary `<img>` cannot supply. Deployments with a private CDN need a suitable signed image URL from the backend. Consumers must never use `file.tus.uploadUrl` as stored file metadata.

## Profile update behavior

`SettingsPage.profileImage()` sends the normalized file fields to `AuthService.updateUserProfile()`:

- `bucket`
- `path`
- `name`
- `url` (the canonical CDN URL)
- `extension`
- `type`
- `size`

The page updates its avatar and browser storage only when `data.updateUserProfile.success` is exactly `true`. A missing result or `success: false` displays the returned message and leaves the previous avatar unchanged. The upload spinner is cleared for success, cancellation, and error paths.

The `user-profile` upload source is image-only. Server upload categories match the TUS allowlist: `chat`, `assessment`, `user-profile`, `media-manager`, `static`, and `project-hub`. Support attachments use `static`; chat attachments use `chat` with separate optional image/video picker restrictions.

Both modal and assessment/review uploaders mount `@uppy/dashboard` directly. Assessment/review targets are conditional: the picker is removed after completion, restored after deleting an answer, and destroyed with its component.

## Verification and rollout

Automated coverage verifies TUS response validation, assessment uploader integration, image-only profile restrictions, canonical profile URL selection, successful profile payloads, and rejected mutations.

After deployment, verify one successful PNG/JPEG upload and one rejected/invalid upload in staging. Monitor upload endpoint errors and `updateUserProfile` failures separately. Logs should include the request/correlation identifier, upload source, HTTP status, and a stable error category such as `empty_upload_response`, `invalid_upload_metadata`, or `profile_update_rejected`; they must not include file bytes, API keys, or full signed URLs.
