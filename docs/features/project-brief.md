# Project Brief Feature

## Overview

The Project Brief feature displays team project information to users on the home page. When a user's team has a project brief configured, a "Project Brief" button appears next to the experience name. Clicking this button opens a modal that displays structured project details.

## Data Flow

```
GraphQL API (teams.projectBrief as stringified JSON)
    ↓
SharedService.getTeamInfo()
    ↓ parseProjectBrief() - safely parses JSON
BrowserStorageService.setUser({ projectBrief: parsedObject })
    ↓
HomePage.updateDashboard()
    ↓ reads from storage
this.projectBrief = this.storageService.getUser().projectBrief
    ↓
Template: *ngIf="projectBrief" shows button
    ↓
showProjectBrief() → opens ProjectBriefModalComponent
```

## Components

### ProjectBriefModalComponent

**Location:** `projects/v3/src/app/components/project-brief-modal/`

**Files:**
- `project-brief-modal.component.ts` - Component logic
- `project-brief-modal.component.html` - Template with sections for each field
- `project-brief-modal.component.scss` - Component-specific styles
- `project-brief-modal.component.spec.ts` - Unit tests

**Input:**
```typescript
@Input() projectBrief: ProjectBrief = {};
```

**Interface:**
```typescript
interface ProjectBrief {
  id?: string;
  title?: string;
  description?: string;
  industry?: string[];
  projectType?: string;
  technicalSkills?: string[];
  professionalSkills?: string[];
  deliverables?: string;
}
```

**Display Sections:**
- Title (headline)
- Description
- Project Type
- Industry (as chips)
- Technical Skills (as chips)
- Professional Skills (as chips)
- Deliverables

**Empty Field Handling:**
- All sections show "None specified" when the field is empty or undefined
- Uses `hasValue()` for string fields and `hasItems()` for array fields

## Integration Points

### SharedService

**Method:** `parseProjectBrief(briefString: string): object | null`

Safely parses the stringified JSON from the API:
- Returns `null` if input is falsy or not a string
- Uses try-catch to handle malformed JSON
- Logs errors to console for debugging

**Usage in getTeamInfo():**
```typescript
this.storage.setUser({
  teamId: teams[0].id,
  teamName: teams[0].name,
  projectBrief: this.parseProjectBrief(teams[0].projectBrief),
  teamUuid: teams[0].uuid
});
```

### HomePage

**Property:**
```typescript
projectBrief: ProjectBrief | null = null;
```

**Loading (in updateDashboard):**
```typescript
this.projectBrief = this.storageService.getUser().projectBrief || null;
```

**Modal Display:**
```typescript
async showProjectBrief(): Promise<void> {
  if (!this.projectBrief) {
    return;
  }

  const modal = await this.modalController.create({
    component: ProjectBriefModalComponent,
    componentProps: {
      projectBrief: this.projectBrief
    },
    cssClass: 'project-brief-modal'
  });

  await modal.present();
}
```

### Template (home.page.html)

Button placement - next to experience name:
```html
<div class="exp-header">
  <h2 class="headline-2" [innerHTML]="experience.name"></h2>
  <ion-button *ngIf="projectBrief"
    fill="clear"
    size="small"
    class="project-brief-btn"
    (click)="showProjectBrief()"
    (keydown.enter)="showProjectBrief()"
    (keydown.space)="showProjectBrief(); $event.preventDefault()"
    aria-label="View project brief" i18n-aria-label>
    <ion-icon name="document-text-outline" slot="start" aria-hidden="true"></ion-icon>
    <span i18n>Project Brief</span>
  </ion-button>
</div>
```

## Styling

### Button (home.page.scss)

```scss
.exp-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.project-brief-btn {
  --padding-start: 8px;
  --padding-end: 8px;
  font-size: 0.875rem;
  text-transform: none;
  letter-spacing: normal;
}
```

### Modal (styles.scss)

```scss
.project-brief-modal {
  --width: 90%;
  --max-width: 500px;
  --height: auto;
  --max-height: 80vh;
  --border-radius: 12px;

  @media (min-width: 768px) {
    --width: 500px;
  }
}
```

## Accessibility

- Button includes `aria-label="View project brief"` with i18n support
- Keyboard navigation with `(keydown.enter)` and `(keydown.space)` handlers
- Modal has proper semantic structure with `<main>`, `<section>`, and heading hierarchy
- Close button includes `aria-label="Close project brief"`
- Ion-chips for industry/skills are visually distinct with color coding

## Sample Data

API returns stringified JSON:
```json
"{\"id\":\"fdcdf0d1-2148-4bab-a02a-62a2ae535fbe\",\"title\":\"Project Title\",\"description\":\"Project description text\",\"industry\":[\"Health & Medical Science\",\"Communications, Media, Digital & Creative\"],\"projectType\":\"Growth Strategy\",\"technicalSkills\":[],\"professionalSkills\":[],\"deliverables\":\"Deliverables description\",\"timeline\":12}"
```

After parsing:
```typescript
{
  id: "fdcdf0d1-2148-4bab-a02a-62a2ae535fbe",
  title: "Project Title",
  description: "Project description text",
  industry: ["Health & Medical Science", "Communications, Media, Digital & Creative"],
  projectType: "Growth Strategy",
  technicalSkills: [],
  professionalSkills: [],
  deliverables: "Deliverables description",
  timeline: 12
}
```

**Note:** The `timeline` field is not displayed in the UI as per requirements.

## Testing

### Unit Tests

**ProjectBriefModalComponent tests:**
- Component creation
- `close()` method dismisses modal
- `hasItems()` correctly identifies empty/populated arrays
- `hasValue()` correctly identifies empty/populated strings
- Template renders title when provided
- Template shows "None specified" for empty fields
- Template renders chips for industry and skills

**HomePage tests (additions needed):**
- Button visible when `projectBrief` is set
- Button hidden when `projectBrief` is null
- `showProjectBrief()` creates and presents modal

**SharedService tests (additions needed):**
- `parseProjectBrief()` returns parsed object for valid JSON
- `parseProjectBrief()` returns null for invalid JSON
- `parseProjectBrief()` returns null for empty string
- `parseProjectBrief()` returns null for null/undefined input

## Module Registration

The component is registered in `ComponentsModule`:

```typescript
// Import
import { ProjectBriefModalComponent } from './project-brief-modal/project-brief-modal.component';

// Declarations
declarations: [
  // ...
  ProjectBriefModalComponent,
  // ...
],

// Exports
exports: [
  // ...
  ProjectBriefModalComponent,
  // ...
],
```
