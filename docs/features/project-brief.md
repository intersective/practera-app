# Project Brief Feature

## Overview

Project Brief displays the learner-safe project snapshot returned with a team. Learners open the shared modal from Home and can download the same content as a PDF. Assessment reviewers use the same modal to inspect a submitter's brief, but do not receive a download control.

## Data Flow

```text
GraphQL API (teams.projectBrief as stringified JSON)
  -> SharedService.getTeamInfo()
  -> SharedService.parseProjectBrief()
  -> BrowserStorageService user record
  -> HomePage.updateDashboard()
  -> HomePage.showProjectBrief()
  -> ProjectBriefModalComponent
```

`SharedService.parseProjectBrief()` safely parses the stringified API value. Falsy, non-string, and malformed values produce no usable brief. Home reads the parsed value from browser storage and only exposes the Project Brief action when a brief is present.

## Centralized Model

The canonical App V2 contract and presentation builder live at `projects/v3/src/app/models/project-brief.model.ts`:

```typescript
interface ProjectBrief {
  schemaVersion?: 2;
  id?: string;
  title?: string;
  description?: string | null;
  organisationName?: string;
  organisationType?: string | null;
  organisationContext?: string | null;
  problemStatement?: string | null;
  focusArea?: string | null;
  scope?: string | null;
  deliverables?: string | null;
  industry?: string[];
  projectType?: string;
  timeline?: number | null;
  location?: string | null;
  website?: string | null;
  technicalSkills?: string[];
  professionalSkills?: string[];
}
```

The app accepts legacy unversioned snapshots and version 2 snapshots with `schemaVersion: 2`. Nullable version 2 text, website, and timeline values normalize to empty presentation values. Empty sections render `None specified` and do not invalidate the remaining brief.

`buildProjectBriefPresentation()` is the sole definition of modal and PDF content order. Consumers must not create or reorder their own section lists. The exact 13-section order is:

1. Project Overview
2. Scope of Work
3. Organisational Context
4. Problem Statement
5. Focus Area
6. Project Outcomes
7. Industry
8. Project Type
9. Duration
10. Location
11. Website
12. Technical Skills
13. Professional Skills

The presentation also provides normalized title, organisation name, organisation type, duration text, chip values, and a safe HTTP(S) website URL.

## Modal And Entry Points

`ProjectBriefModalComponent` receives the public `projectBrief` and optional `allowPdfDownload` properties through Ionic `componentProps`. `allowPdfDownload` defaults to `false`, so callers must opt in explicitly.

Home is the only caller that enables export:

```typescript
const modal = await this.modalController.create({
  component: ProjectBriefModalComponent,
  componentProps: {
    projectBrief: this.projectBrief,
    allowPdfDownload: true,
  },
  cssClass,
});
await modal.present();
```

Assessment opens the same component with only `projectBrief`; it supplies no download command and retains the default `allowPdfDownload: false`.

The modal renders organisation metadata when supplied, then the centralized accordion sections. Header icons and all chips use Ionic `color="primary"`; chips are outlined. During export, the download control is disabled and displays `Preparing PDF...`. Duplicate selections are ignored while the promise is pending. Both successful and failed downloads keep the modal open. Failures show an extractable localized danger toast through `NotificationsService.presentToast`.

## Markdown And Link Security

Markdown fields pass through `ProjectBriefMarkdownPipe`. It uses `marked@18.0.10`, removes raw HTML and image tokens, and then applies Angular HTML sanitization. Markdown links are clickable only when `safeHttpUrl()` accepts an absolute `http:` or `https:` URL. Unsafe or relative link destinations remain readable text without a navigation target.

The PDF service uses the Marked lexer rather than HTML rendering. It writes Markdown headings, paragraphs, ordered list items, and unordered list items as selectable PDF text, and omits raw HTML and image tokens. It does not use jsPDF HTML, canvas, or image APIs.

## PDF Export

`ProjectBriefPdfService` lives at `projects/v3/src/app/services/project-brief-pdf.service.ts`. Its loader token dynamically imports `jspdf@4.2.1` only when a learner selects download; constructing the service or creating the modal does not load jsPDF.

The export is an offline A4 PDF with built-in Helvetica fonts, 20 mm margins, `splitTextToSize()` wrapping, page breaks before overflow, and page numbers added after the final page count is known. It uses the `buildProjectBriefPresentation()` order and includes organisation metadata plus `None specified` values where applicable.

The filename is `<safe-lowercase-project-title>-project-brief.pdf`. Empty, punctuation-only, or otherwise unsluggable titles use `project-brief.pdf`.

Safe absolute HTTP(S) website values become PDF links. Unsafe website values remain readable but non-clickable text. The export includes no remote logos, images, backgrounds, or network fetches.

Built-in fonts support the intended Latin-script content. Japanese PDF font coverage is deferred; adding it requires an approved embedded-font implementation.

## Accessibility

The modal provides a localized `Project Brief` title, a localized close control with `aria-label="Close project brief"`, hidden decorative icons, and Ionic accordion controls for section navigation. The Home Project Brief action and modal close action support click, Enter, and Space. The download button exposes its disabled loading state through the native Ionic button control.

## Tests

Focused coverage exists for the centralized model, Markdown pipe, PDF service, Project Brief modal, Home entry point, and Assessment entry point. PDF coverage includes lazy loading, filename sanitization, centralized ordering, empty values, Markdown hierarchy and stripping, wrapping, page breaks, page numbers, safe links, failure cleanup, retry, and asynchronous save normalization. Home verifies `allowPdfDownload: true`; Assessment verifies it remains absent.

## Runtime Dependency Risk

`marked@18.0.10` and `jspdf@4.2.1` are exact locked runtime dependencies. `marked` handles untrusted learner-visible Markdown, so the token-based raw HTML/image exclusion and Angular sanitization boundary must remain intact. jsPDF creates a local browser download and is dynamically imported only from the export action. Do not replace either dependency with one that uploads content, executes shell commands, or fetches remote branding assets.
