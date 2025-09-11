# Assessment Flow Documentation

## Overview

This document provides a comprehensive overview of how the Practera AppV2 assessment system works, covering the flow from activity pages through assessment components to form validation and submission handling for both learners and reviewers.

## Architecture Overview

The assessment system follows a hierarchical component structure with clear separation of concerns:

```
Activity Pages (Desktop/Mobile)
    ↓
Assessment Component (Central Hub)
    ↓
Question Components (Text, File, Multiple Choice, etc.)
    ↓
Bottom Action Bar (Submit/Continue Button)
```

## Core Components

### 1. Entry Point Pages

#### Activity Desktop Page (`activity-desktop.page.ts`)
- **Purpose**: Main desktop interface for learners doing assessments
- **Key Responsibilities**:
  - Manages activity and task navigation
  - Handles assessment loading and submission
  - Controls button states and loading indicators
  - Coordinates with activity service for task progression

**Key Properties:**
```typescript
assessment = this.assessmentService.assessment$;
submission: Submission;
review: AssessmentReview;
savingText$: BehaviorSubject<string> = new BehaviorSubject<string>('');
btnDisabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
```

**Assessment Flow:**
1. Loads assessment via `assessmentService.getAssessment()`
2. Displays assessment component with current data
3. Handles save events from assessment component
4. Manages button states during submission

#### Assessment Mobile Page (`assessment-mobile.page.ts`)
- **Purpose**: Mobile-optimized interface for assessments
- **Similar functionality** to desktop but adapted for mobile UX
- **Key Differences**: 
  - Mobile-specific navigation patterns
  - Touch-optimized interactions
  - Responsive layout adjustments

#### Review Desktop Page (`review-desktop.page.ts`)
- **Purpose**: Interface for reviewers to evaluate learner submissions
- **Key Responsibilities**:
  - Manages review list and current review selection
  - Handles review submission and feedback
  - Coordinates between review list and assessment components

**Review-Specific Properties:**
```typescript
currentReview: Review;
reviews: Review[];
noReview: boolean = false;
```

### 2. Central Assessment Component (`assessment.component.ts`)

The assessment component is the central hub that orchestrates the entire assessment experience for both learners and reviewers.

#### Core State Management

**Action Types:**
- `'assessment'` - Learner doing assessment or viewing feedback
- `'review'` - Reviewer providing feedback on learner submission

**State Flags:**
```typescript
doAssessment: boolean = false;        // Learner can edit assessment
isPendingReview: boolean = false;     // Reviewer can edit review
feedbackReviewed: boolean = false;    // Learner has seen feedback
```

**Form Management:**
```typescript
questionsForm: FormGroup = new FormGroup({});
// Form controls named 'q-{questionId}' for dynamic question handling
```

#### Data Flow Logic

**For Learners (`action === 'assessment'`):**
1. **Not Started/In Progress**: `doAssessment = true`
   - Form controls are editable
   - Required validators applied to learner-audience questions
   - Auto-save functionality enabled
   - Submit button available

2. **Pending Review**: Read-only mode
   - Form controls disabled
   - Show "waiting for review" message
   - No submit functionality

3. **Feedback Available**: Read-only with feedback
   - Display learner answers and reviewer feedback
   - "Mark as Read" button to acknowledge feedback
   - Navigation to next task after reading

**For Reviewers (`action === 'review'`):**
1. **Pending Review**: `isPendingReview = true`
   - Display learner submission as reference (read-only)
   - Reviewer form controls are editable
   - Required validators applied to reviewer-audience questions
   - "Submit Review" button available

2. **Review Complete**: Read-only mode
   - Show completed review
   - No further editing allowed

#### Form Population Logic

**Assessment Answers (`this.action === 'assessment'`):**
```typescript
// Populate with submission answers
if (this.submission?.answers) {
  Object.keys(this.submission.answers).forEach(questionId => {
    const control = this.questionsForm.get('q-' + questionId);
    if (control && this.submission.answers[questionId]?.answer !== undefined) {
      control.setValue(this.submission.answers[questionId].answer, { emitEvent: false });
    }
  });
}
```

**Review Answers (`this.action === 'review'`):**
```typescript
// Populate with review answers (answer + comment structure)
if (this.review?.answers) {
  Object.keys(this.review.answers).forEach(questionId => {
    const control = this.questionsForm.get('q-' + questionId);
    if (control && this.review.answers[questionId]) {
      const reviewAnswer = {
        answer: this.review.answers[questionId].answer,
        comment: this.review.answers[questionId].comment
      };
      control.setValue(reviewAnswer, { emitEvent: false });
    }
  });
}
```

#### Required Field Validation

**Validation Rules:**
- Required validators only applied when user can edit
- `doAssessment = true`: Learner doing assessment
- `isPendingReview = true`: Reviewer doing review
- Read-only modes have no required validation

**Implementation:**
```typescript
private _populateQuestionsForm() {
  this.assessment.groups.forEach(group => {
    group.questions.forEach(question => {
      let validator = [];
      
      // Apply required validator based on user role and edit permissions
      if (this._isRequired(question) === true) {
        validator = [Validators.required];
      }

      this.questionsForm.addControl('q-' + question.id, new FormControl('', validator));
    });
  });

  // Update button state based on form validity
  this.questionsForm.valueChanges.pipe(
    takeUntil(this.unsubscribe$),
    debounceTime(300),
  ).subscribe(() => {
    this.btnDisabled$.next(this.questionsForm.invalid);
  });
}

private _isRequired(question: Question): boolean {
  if (!question.isRequired) return false;
  
  // Check if current user can edit and question applies to them
  if (this.doAssessment && question.audience.includes('submitter')) {
    return true;
  }
  
  if (this.isPendingReview && question.audience.includes('reviewer')) {
    return true;
  }
  
  return false;
}
```

### 3. Question Components

Each question type has its dedicated component that handles specific input requirements:

#### File Upload Component (`app-file-upload`)
**Dual Purpose Display:**
- **Learner View**: Shows upload interface or uploaded file
- **Reviewer View**: Shows learner's file + reviewer's file upload interface

**Key Properties:**
```typescript
[question]="question"                    // Question metadata
[doAssessment]="doAssessment"           // Learner can edit
[doReview]="isPendingReview"            // Reviewer can edit
[submission]="submission?.answers[question.id] || {}"  // Learner's answer
[review]="review?.answers[question.id] || {}"          // Reviewer's answer
[control]="questionsForm?.controls['q-' + question.id]" // Form control
```

**Form Control Updates:**
```typescript
onFileUploaded(file: any) {
  if (this.doReview && this.control) {
    this.control.setValue(file);
    this.control.markAsTouched();
    this.control.updateValueAndValidity();
  }
}

onFileRemoved() {
  if (this.doReview && this.control) {
    this.control.setValue(null);
    this.control.markAsTouched();
    this.control.updateValueAndValidity();
  }
}
```

#### Other Question Components
- **Text Component** (`app-text`): Text input with rich text support
- **Multiple Component** (`app-multiple`): Multiple choice questions
- **Oneof Component** (`app-oneof`): Single choice questions
- **Team Member Selector** (`app-team-member-selector`): Team member selection

All follow similar patterns with dual-purpose display for learner/reviewer contexts.

### 4. Bottom Action Bar (`bottom-action-bar.component.html`)

**Purpose**: Provides the primary action button for assessment submission/continuation

**Key Features:**
```html
<ion-button class="action-button"
  mode="ios"
  [disabled]="disabled$ | async"
  [color]="color"
  (click)="onClick($event)"
>{{ text }}</ion-button>
```

**Button States:**
- **Enabled**: Form is valid and user can submit
- **Disabled**: Form has validation errors or submission in progress
- **Dynamic Text**: Changes based on context (Submit, Continue, Mark as Read, etc.)

## Data Flow Diagrams

### Assessment Submission Flow (Learner)

```
1. Activity Desktop Page
   ↓ (Load Assessment)
2. AssessmentService.fetchAssessment()
   ↓ (GraphQL Query)
3. Assessment Component receives data
   ↓ (Initialize form)
4. Question Components populate with answers
   ↓ (User interaction)
5. Form validation triggers
   ↓ (Valid form)
6. Bottom Action Bar enabled
   ↓ (User clicks submit)
7. Assessment Component emits save event
   ↓ (Handle save)
8. Activity Desktop Page calls AssessmentService.submitAssessment()
   ↓ (API call)
9. Success: Navigate to next task
```

### Review Submission Flow (Reviewer)

```
1. Review Desktop Page
   ↓ (Select Review)
2. AssessmentService.fetchAssessment() with action='review'
   ↓ (GraphQL Query with reviewer=true)
3. Assessment Component receives:
   - Assessment structure
   - Learner submission (reference)
   - Review data (editable)
   ↓ (Initialize form)
4. Question Components show:
   - Learner answers (read-only)
   - Reviewer input fields (editable)
   ↓ (Reviewer interaction)
5. Form validation for reviewer fields
   ↓ (Valid review form)
6. Bottom Action Bar enabled
   ↓ (Reviewer clicks submit)
7. Assessment Component emits save event
   ↓ (Handle review save)
8. Review Desktop Page calls AssessmentService.submitReview()
   ↓ (API call)
9. Success: Update review list
```

## Form Validation System

### Validation Rules

**Required Field Logic:**
```typescript
// Only apply required validation when user can edit
if (this._isRequired(question) === true) {
  validator = [Validators.required];
}

private _isRequired(question: Question): boolean {
  if (!question.isRequired) return false;
  
  // Learner doing assessment
  if (this.doAssessment && question.audience.includes('submitter')) {
    return true;
  }
  
  // Reviewer doing review
  if (this.isPendingReview && question.audience.includes('reviewer')) {
    return true;
  }
  
  return false;
}
```

**Button State Management:**
```typescript
this.questionsForm.valueChanges.pipe(
  debounceTime(300),
  takeUntil(this.unsubscribe$)
).subscribe(() => {
  // Update button disabled state based on form validity
  this.btnDisabled$.next(this.questionsForm.invalid);
  
  // Update page completion tracking for pagination
  this.initializePageCompletion();
});
```

### Validation Flow for Required File Questions

**Scenario**: Reviewer must upload a file for a required question

1. **Form Setup**:
   ```typescript
   // question.isRequired = true, question.audience = ['reviewer']
   // isPendingReview = true (reviewer can edit)
   const validator = [Validators.required];
   this.questionsForm.addControl('q-' + question.id, new FormControl('', validator));
   ```

2. **Initial State**:
   - Form control value: `null` or `''`
   - Form validity: `invalid`
   - Button state: `disabled`

3. **File Upload**:
   ```typescript
   // File upload component updates control
   this.control.setValue(fileObject);
   this.control.updateValueAndValidity();
   ```

4. **Validation Update**:
   - Form control value: `fileObject`
   - Form validity: `valid`
   - Button state: `enabled`

## Assessment Pagination System

### Core Properties
```typescript
pageSize = 8;                           // Maximum questions per page
pageIndex: number = 0;                  // Current page (0-based)
pagesGroups: any[] = [];               // Pages containing question groups
pageRequiredCompletion: boolean[] = []; // Completion status per page
readonly manyPages = 6;                 // Minimum pages for scrollable pagination
```

### Page Generation Logic
```typescript
splitGroupsByQuestionCount() {
  // Divides assessment groups into pages
  // - Multiple small groups can fit on one page if total questions ≤ pageSize
  // - Large groups with >pageSize questions are split across multiple pages
  // - Preserves group structure where possible
}
```

### Navigation Methods
```typescript
prevPage()              // Go to previous page with boundary check
nextPage()              // Go to next page with boundary check
goToPage(i: number)     // Jump to specific page with validation
```

### Completion Tracking
```typescript
initializePageCompletion() {
  // Updates status array for required questions
  this.pageRequiredCompletion = this.pagesGroups.map(pageGroups => {
    const questions = this.getAllQuestionsForPage(pageIndex);
    return this.areAllRequiredQuestionsAnswered(questions);
  });
}
```

## Error Handling

### Validation Errors
- Form validation prevents submission when required fields are empty
- Visual indicators show which fields need attention
- Real-time validation feedback as user types/selects

### Network Errors
- Auto-save failures trigger retry mechanism
- Submission failures show error messages
- Automatic logout if JWT token expires

### File Upload Errors
- Upload failures with retry mechanisms
- File size and type validation
- Progress indicators during upload

## Security Considerations

### Role-Based Access
- Questions can specify audience: `['submitter', 'reviewer']`
- Form controls only editable based on user role and submission status
- API validates user permissions before allowing actions

### Data Integrity
- Form validation ensures required fields are completed
- Server-side validation confirms data integrity
- Optimistic updates with rollback on failure

## Performance Optimizations

### Change Detection
```typescript
changeDetection: ChangeDetectionStrategy.OnPush
```

### Observable Management
```typescript
takeUntil(this.unsubscribe$)  // Prevent memory leaks
debounceTime(300)             // Reduce validation frequency
shareReplay(1)                // Cache service responses
```

### Lazy Loading
- Question components loaded on demand
- Assessment data fetched when needed
- Pagination reduces DOM complexity

## Testing Considerations

### Unit Tests
- Mock assessment service responses
- Test form validation logic
- Verify button state changes
- Component interaction testing

### Integration Tests
- End-to-end assessment submission flow
- Review workflow testing
- File upload functionality
- Cross-browser compatibility

### Test Scenarios
1. **Learner Assessment Flow**:
   - Start new assessment
   - Save progress (auto-save)
   - Submit assessment
   - View feedback

2. **Reviewer Flow**:
   - View learner submission
   - Provide feedback
   - Submit review
   - Handle required fields

3. **Edge Cases**:
   - Network interruptions
   - Invalid file uploads
   - Session timeouts
   - Concurrent submissions

## Configuration

### Environment Features
```typescript
environment.featureToggles.assessmentPagination  // Enable/disable pagination
```

### Question Types
- `text` - Text input
- `file` - File upload
- `video` - Video file upload
- `oneof` - Single choice
- `multiple` - Multiple choice
- `team-member-selector` - Team member selection
- `multi-team-member-selector` - Multiple team member selection

## API Integration

### GraphQL Queries
```graphql
query getAssessment($assessmentId: Int!, $reviewer: Boolean!, $activityId: Int, $contextId: Int!, $submissionId: Int) {
  assessment(id:$assessmentId, reviewer:$reviewer, activityId:$activityId, submissionId:$submissionId) {
    id name type description dueDate isTeam pulseCheck allowResubmit
    groups {
      name description
      questions {
        id name description type isRequired hasComment audience fileType
        choices { id name explanation description }
        teamMembers { userId userName teamId }
      }
    }
    submissions(contextId:$contextId) {
      id status completed modified locked
      submitter { name image team { name } }
      answers { questionId answer file { name url type } }
      review {
        id status modified meta
        reviewer { name }
        answers { questionId answer comment file { name url type size } }
      }
    }
  }
}
```

### Mutation Operations
- `submitAssessment` - Learner submission
- `submitReview` - Reviewer feedback
- `saveAnswers` - Auto-save progress

## Conclusion

The assessment system provides a comprehensive, role-based assessment and review platform with comprehensive form validation, real-time feedback, and optimized user experience for both learners and reviewers. The modular architecture ensures maintainability while the reactive patterns provide responsive user interactions.

Key strengths:
- Clear separation of concerns between components
- Reactive form validation with real-time feedback
- Dual-purpose components for learner/reviewer contexts
- Robust error handling and network resilience
- Performance optimizations for large assessments
- Comprehensive pagination system for long assessments
