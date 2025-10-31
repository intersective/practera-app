# WCAG 2.1 Level AA Accessibility Checklist - V3 Ionic App

This checklist verifies compliance with WCAG 2.1 Level AA standards for the V3 Ionic mobile application.

## ✅ Completed Items

### 1. Perceivable

#### 1.1.1 Non-text Content (Level A)
- [x] HTML lang attribute set to "en" in index.html
- [ ] **TODO**: Verify all images have descriptive alt text or are marked decorative
- [ ] **TODO**: Verify all form inputs have associated labels
- [ ] **TODO**: Verify icon-only buttons have aria-label attributes
- [ ] **TODO**: Verify decorative images/icons have aria-hidden="true"

#### 1.3.1 Info and Relationships (Level A)
- [x] Form fields grouped with fieldsets/legends for radio buttons and checkboxes (multiple, oneof components)
- [x] Form inputs have proper label associations (ion-label with for attribute)
- [x] Error messages associated with form fields via aria-describedby (text component)
- [ ] **TODO**: Verify heading hierarchy (h1 > h2 > h3) is logical and sequential across all pages
- [ ] **TODO**: Verify all tables have proper header associations

#### 1.4.3 Contrast (Minimum) (Level AA)
- [ ] **TODO**: Verify all text meets 4.5:1 contrast ratio for normal text
- [ ] **TODO**: Verify all text meets 3:1 contrast ratio for large text (18pt+ or 14pt+ bold)
- [ ] **TODO**: Check color variables in variables.scss for WCAG compliance

#### 1.4.4 Resize Text (Level AA)
- [x] Viewport meta tag present in index.html
- [ ] **TODO**: Verify text can be resized up to 200% without loss of functionality

#### 1.4.10 Reflow (Level AA)
- [x] Responsive design implemented with Ionic framework
- [ ] **TODO**: Verify content reflows horizontally without requiring scrolling at 320px width

#### 1.4.11 Non-text Contrast (Level AA)
- [ ] **TODO**: Verify UI components and graphical objects have 3:1 contrast ratio

#### 1.4.12 Text Spacing (Level AA)
- [ ] **TODO**: Verify text remains readable when spacing is adjusted per WCAG guidelines

#### 1.4.13 Content on Hover or Focus (Level AA)
- [ ] **TODO**: Verify tooltips/popovers can be dismissed, hovered, and are persistent

### 2. Operable

#### 2.1.1 Keyboard (Level A)
- [ ] **TODO**: Verify skip navigation links implemented
- [ ] **TODO**: Verify all interactive elements are keyboard accessible
- [ ] **TODO**: Verify custom buttons have keyboard event handlers (Enter/Space)
- [ ] **TODO**: Verify keyboard trap handling in modals

#### 2.1.2 No Keyboard Trap (Level A)
- [ ] **TODO**: Verify users can navigate away from all components using only keyboard
- [ ] **TODO**: Verify modals have proper focus management

#### 2.1.4 Character Key Shortcuts (Level A)
- [ ] **TODO**: Verify no single key shortcuts that aren't configurable or can be turned off

#### 2.4.1 Bypass Blocks (Level A)
- [ ] **TODO**: Verify skip navigation links to main content and navigation implemented
- [ ] **TODO**: Verify main content has id="main-content"

#### 2.4.2 Page Titled (Level A)
- [x] Home page sets title via utils.setPageTitle()
- [ ] **TODO**: Verify all pages have descriptive, unique titles
- [ ] **TODO**: Add Title service to all page components

#### 2.4.3 Focus Order (Level A)
- [x] Logical tab order implemented with Ionic components
- [ ] **TODO**: Verify focus order is logical and intuitive

#### 2.4.4 Link Purpose (In Context) (Level A)
- [ ] **TODO**: Verify all links have descriptive text or aria-label
- [ ] **TODO**: Verify icon-only links have aria-label

#### 2.4.5 Multiple Ways (Level AA)
- [x] Navigation menu provides multiple ways to access content
- [ ] **TODO**: Verify search functionality exists where appropriate

#### 2.4.6 Headings and Labels (Level AA)
- [x] Form labels are descriptive (ion-label with for attribute)
- [ ] **TODO**: Verify heading structure is logical
- [ ] **TODO**: Verify all form inputs have visible labels

#### 2.4.7 Focus Visible (Level AA)
- [ ] **TODO**: Verify all focusable elements have visible focus indicators
- [ ] **TODO**: Verify focus styles implemented in global styles

#### 2.5.1 Pointer Gestures (Level A)
- [x] No path-based gestures required (Ionic handles this)
- [ ] **TODO**: Verify swipe gestures have alternative methods

#### 2.5.2 Pointer Cancellation (Level A)
- [x] Button clicks use onClick handlers (Ionic handles this)
- [ ] **TODO**: Verify no accidental activations

#### 2.5.3 Label in Name (Level A)
- [ ] **TODO**: Verify button labels match accessible names (aria-label matches visible text)
- [ ] **TODO**: Verify all interactive elements have matching labels

#### 2.5.4 Motion Actuation (Level A)
- [ ] **TODO**: Verify no functionality depends on device motion or user motion

### 3. Understandable

#### 3.1.1 Language of Page (Level A)
- [x] HTML lang attribute set to "en" in index.html
- [ ] **TODO**: Verify lang attribute is correctly set on html tag

#### 3.2.1 On Focus (Level A)
- [ ] **TODO**: Verify no context changes occur on focus

#### 3.2.2 On Input (Level A)
- [ ] **TODO**: Verify no context changes occur on input (except submit buttons)

#### 3.2.3 Consistent Navigation (Level AA)
- [x] Navigation is consistent across pages
- [ ] **TODO**: Verify navigation order is consistent

#### 3.2.4 Consistent Identification (Level AA)
- [ ] **TODO**: Verify components with same functionality are identified consistently

#### 3.3.1 Error Identification (Level A)
- [x] Error messages associated with form fields (text component)
- [ ] **TODO**: Verify all form errors are clearly identified
- [ ] **TODO**: Verify error messages are in text format

#### 3.3.2 Labels or Instructions (Level A)
- [x] Form labels present (ion-label with for attribute)
- [ ] **TODO**: Verify all form inputs have labels or instructions

#### 3.3.3 Error Suggestion (Level AA)
- [ ] **TODO**: Verify error messages provide suggestions for correction where applicable

#### 3.3.4 Error Prevention (Legal, Financial, Data) (Level AA)
- [ ] **TODO**: Verify submissions can be reviewed, confirmed, or corrected

### 4. Robust

#### 4.1.1 Parsing (Level A)
- [ ] **TODO**: Verify no duplicate IDs exist
- [ ] **TODO**: Verify all IDs are unique

#### 4.1.2 Name, Role, Value (Level A)
- [x] Form inputs have proper labels (ion-label with for attribute)
- [x] ARIA attributes used where appropriate (aria-label, aria-live, role)
- [ ] **TODO**: Verify all custom components have proper roles
- [ ] **TODO**: Verify all interactive elements have accessible names

#### 4.1.3 Status Messages (Level AA)
- [x] Loading states have role="status" and aria-live="polite" (assessment component)
- [x] Saving messages have aria-live="polite" (assessment component)
- [ ] **TODO**: Verify all status messages are announced to screen readers
- [ ] **TODO**: Verify error messages use role="alert" and aria-live="assertive"

## Testing Checklist

### Manual Testing
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Test keyboard navigation (Tab, Shift+Tab, Enter, Space, Arrow keys)
- [ ] Test color contrast with browser dev tools
- [ ] Test at 200% zoom level
- [ ] Test on mobile devices
- [ ] Test with voice control software

### Automated Testing
- [ ] Run axe DevTools scan
- [ ] Run WAVE accessibility checker
- [ ] Run Lighthouse accessibility audit
- [ ] Verify no console errors related to accessibility

## Verified Components

### Pages
- [ ] home.page.ts/html
- [ ] tabs.page.ts/html
- [ ] auth-login.component.ts/html
- [ ] activity-desktop.page.ts/html
- [ ] activity-mobile.page.ts/html
- [ ] assessment-mobile.page.ts/html
- [ ] review-desktop.page.ts/html
- [ ] review-mobile.page.ts/html
- [ ] topic-mobile.page.ts/html
- [ ] settings.page.ts/html
- [ ] events pages
- [ ] chat pages

### Components
- [x] text.component.html - Has labels, aria attributes, error handling
- [x] multiple.component.html - Has fieldset/legend, aria attributes
- [x] oneof.component.html - Has fieldset/legend, aria attributes
- [ ] assessment.component.html - Partially verified (has loading states)
- [ ] activity.component.html
- [ ] branding-logo.component.html
- [ ] contact-number-form.component.html
- [ ] review-rating.component.html
- [ ] team-member-selector.component.html
- [ ] fast-feedback.component.html
- [ ] chat components
- [ ] event components

## Notes

- Home page already implements page title setting via `utils.setPageTitle()`
- Form components (text, multiple, oneof) already have good accessibility foundations
- Assessment component has loading states with proper ARIA
- Need to verify and add page titles to all page components
- Need to add skip navigation links to app.component.html
- Need to verify color contrast in variables.scss

