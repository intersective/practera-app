### Description

This directory holds `lambda@edge` functions deployed to CloudFront as `origin-request` handlers.

`forwarder` - rewrites incoming CloudFront URIs to the correct S3 object keys for the Angular i18n locale builds.
`versioner` - creates a numbered Lambda version ARN that CloudFront requires for Lambda@Edge associations.

---

### i18n / Angular Build Output Dependency

The `forwarder` function is **tightly coupled** to the Angular build output directory structure. Breaking this coupling causes S3 `AccessDenied` (403) errors surfaced as raw XML to end users.

#### How Angular i18n builds are deployed

`projects/v3` is compiled with `"localize": true` in `angular.json`, producing one subfolder per locale:

| Angular version | Build output path | S3 object key prefix |
|-----------------|-------------------|----------------------|
| 17 / 18 (webpack builder) | `dist/v3/{locale}/` | `/{locale}/` |
| **19+ (application builder)** | `dist/v3/browser/{locale}/` | `/browser/{locale}/` |

The `aws s3 sync dist/v3/ s3://$BUCKET --delete` step (CI/CD step 22) mirrors this structure directly into S3, so the S3 key prefix always matches the build output.

#### What the forwarder does

CloudFront does **not** forward query strings to S3 (`QueryString: false`). When a user visits a deep-link such as `/en-US?auth_token=…`, CloudFront calls the forwarder with `request.uri = "/en-US"`. The forwarder:

1. Extracts the first path segment as the locale (`en-US`, `ja`, `ms`, `es`).
2. For unknown locales or bare `/`, falls back to the default locale.
3. For SPA routes (no file extension), rewrites to `/{prefix}/{locale}/index.html`.
4. For static assets (with file extension), rewrites to `/{prefix}{original_uri}`.
5. Passes `version.json` requests through unchanged (whitelist).

#### Supported locales

The locale whitelist in `forwarder/index.js` must stay in sync with the locales configured in `angular.json`:

```javascript
const locales = ["en-US", "ja", "ms", "es"];
```

To add a new locale: update both `angular.json` (`i18n.locales`) **and** the `locales` array in `forwarder/index.js`.

#### ⚠️ What to check on every Angular major version upgrade

When upgrading Angular major versions, verify the build output structure has not changed before deploying:

```bash
# after building, check what subdirectories are produced
ls dist/v3/
# Angular 19+: should show  browser/
# Angular 17/18: should show  en-US/  ja/  ms/  es/
```

If the output structure changes, update the path prefix in `forwarder/index.js` **before** merging to trunk so both changes deploy together in the same CI/CD run.

#### Incident history

| Date | Trigger | Symptom | Fix |
|------|---------|---------|-----|
| March 2026 | Angular 18 → 19 upgrade | S3 `AccessDenied` XML shown to all users on `app.p2-stage.practera.com` | Added `/browser/` prefix to all rewritten URIs in `forwarder/index.js` |

---

### Deployment

Once `AWS` credentials are ready, run `deploy.sh`. Requires [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html).

In CI/CD (`p2-stage-appv3.yml`) the deploy sequence is:
1. Build Angular app (`ng build v3`)
2. Deploy Lambda@Edge (`bash lambda/deploy.sh`) → exports `HandlerVersionArn`
3. Deploy CloudFormation/Serverless stack (picks up new `HandlerVersionArn`)
4. Sync `dist/v3/` to S3

Both the Lambda function and the S3 content must reflect the same output path structure.