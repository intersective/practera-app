# Full Project Brief and PDF Export Implementation Plan

> **For agentic workers:** Use test-driven development. Do not commit, push, deploy, or modify unrelated working-tree files.

**Goal:** Display every learner-visible Project Hub brief field in App V2 and allow learners to download the displayed brief as a PDF.

**Architecture:** Project Hub remains the data producer and writes a versioned learner-safe snapshot into Practera's `team.projectBrief`. App V2 remains the consumer, renders the snapshot through a sanitized Markdown boundary, and lazily generates the PDF from the same presentation model. An explicit Project Hub admin action refreshes existing team snapshots.

**Repositories:**
- App V2: `/Users/chaw/Workspaces/www/intersective/app-ionic7`
- Project Hub: `/Users/chaw/Workspaces/www/intersective/project-hub`

## Global Constraints

- Preserve the unrelated Project Hub `next-env.d.ts` modification.
- Keep contact details, internal metadata, images, application counts, and capacity out of the Practera snapshot and PDF.
- Keep the separate team/project-brief visibility toggle request out of scope.
- Use `schemaVersion: 2` while accepting legacy unversioned snapshots.
- PDF download is enabled only from learner Home; assessment reviewers continue to use the modal without download.
- Use `marked@18.0.10` and `jspdf@4.2.1`; lazy-load jsPDF.
- This release supports Latin-script PDF content. Japanese PDF font coverage is deferred.

### Task 1: Expand the Project Hub brief contract

- Add failing encoder tests for all learner-visible fields and private-field exclusion.
- Expand `EncodedBrief` and `encodeBriefForPractera()` with `schemaVersion`, organisation details, problem statement, focus area, location, and website.
- Keep all existing keys backward compatible and verify focused tests.

### Task 2: Synchronize existing Project Hub team snapshots

- Add failing integration tests for successful, skipped, malformed, missing, partial-failure, and repeatable sync behavior.
- Add `POST /api/experiences/[id]/teams/sync-project-briefs` with sequential Practera updates and a structured result.
- Add an explicit Teams-page action with confirmation, progress, success counts, and failed-team details.
- Add Project Hub contract/sync documentation and verify focused tests.

### Task 3: Expand and safely render the App V2 brief

- Add exact runtime dependencies and lockfile changes.
- Centralize the optional `ProjectBrief` contract and update storage/Home/Assessment/modal imports.
- Add failing tests for legacy and version-2 payloads, all learner-visible sections, empty states, Markdown sanitization, and safe websites.
- Render the full brief with Angular control flow while preserving current primary branding.

### Task 4: Add learner-only PDF export

- Add failing tests for learner-only visibility, filename, section order, pagination, duplicate-click prevention, and failure recovery.
- Build a shared presentation model and lazy jsPDF service with selectable A4 text, wrapping, page breaks, page numbers, and safe links.
- Pass `allowPdfDownload: true` from Home only and retain the assessment default of `false`.
- Update App V2 project-brief documentation.

### Task 5: Verify the coordinated change

- Run Project Hub Jest tests, non-writing ESLint, and production build.
- Run App focused tests, lint, build, production dependency audit, and `git diff --check`.
- Report baseline failures separately and do not repair unrelated suites.
- Stage deployment and authenticated P2 Stage browser checks remain a separate operational gate.
