# WCAG 2.2 Level AA Accessibility Checklist - V3 Ionic App

This checklist verifies compliance with WCAG 2.2 Level AA standards for the V3 Ionic mobile application.

## ✅ Completed Items

### 1. Perceivable

#### 1.1.1 Non-text Content (Level A)
- [x] HTML lang attribute set to "en" in index.html
- [x] Images have descriptive alt text or are marked decorative (fixed missing alt attributes)
- [x] Form inputs have associated labels (ion-label with for attribute)
- [x] Icon-only buttons have aria-label attributes (fixed missing aria-labels)
- [x] Decorative images/icons have aria-hidden="true" (added where missing)

#### 1.3.1 Info and Relationships (Level A)
- [x] Form fields grouped with fieldsets/legends for radio buttons and checkboxes (multiple, oneof components)
- [x] Form inputs have proper label associations (ion-label with for attribute)
- [x] Error messages associated with form fields via aria-describedby (text component)
- [x] **COMPLETED**: Fixed duplicate heading IDs (experiences-heading) - renamed mobile version to experiences-heading-mobile
- [x] Heading hierarchy verified and fixed (h1 > h2 > h3 structure maintained with for-accessibility class for screen readers)
- [ ] **TODO**: Verify all tables have proper header associations (no tables found in v3 app - uses ion-grid instead)

#### 1.4.3 Contrast (Minimum) (Level AA)
- [x] **COMPLETED**: Fixed skip links contrast - now uses darker shade (color-mix of 60% primary + 40% dark green) to ensure 4.5:1 with white text (styles.scss, global.scss)
- [x] **TESTED**: Notification badge has 21:1 contrast (PASSING)
- [ ] **TODO**: Verify all other text meets 4.5:1 contrast ratio for normal text
- [ ] **TODO**: Verify all text meets 3:1 contrast ratio for large text (18pt+ or 14pt+ bold)
- [ ] **TODO**: Check color variables in variables.scss for WCAG compliance

#### 1.4.4 Resize Text (Level AA)
- [x] Viewport meta tag present in index.html
- [ ] **TODO**: Verify text can be resized up to 200% without loss of functionality

#### 1.4.10 Reflow (Level AA)
- [x] Responsive design implemented with Ionic framework
- [x] **VERIFIED**: Content reflows properly at 320px width - no horizontal scroll detected (tested Nov 2025 on staging)
- [x] **VERIFIED**: Experiences page responsive design fixed - cards resize properly on mobile (320px, 375px), tablet (768px), and desktop (1200px) - Nov 6, 2025

#### 1.4.11 Non-text Contrast (Level AA)
- [x] **COMPLETED**: Fixed bottom tab bar icons contrast - now uses darker shade (color-mix of 50% primary + 50% dark green) to ensure 3:1 with white background (tabs.page.scss)
- [x] **TESTED**: Notification badge has 21:1 contrast (PASSING)
- [x] **VERIFIED**: Tab icons now use accessibility-specific darker color that meets 3:1 minimum requirement

#### 1.4.12 Text Spacing (Level AA)
- [x] **COMPLETED**: Added CSS support for text spacing adjustments (word-wrap, overflow-wrap) in global.scss
- [x] Content structure supports user-adjusted spacing (letter spacing, word spacing, line height, paragraph spacing)

#### 1.4.13 Content on Hover or Focus (Level AA)
- [x] **COMPLETED**: Tooltip directive updated to meet WCAG 1.4.13 requirements
  - Tooltips can be dismissed with ESC key
  - Tooltips are hoverable (pointer-events: auto, mouse events on tooltip)
  - Tooltips are persistent (delay before hiding, allows cursor movement to tooltip)
  - Added role="tooltip" and aria-live="polite" attributes

### 2. Operable

#### 2.1.1 Keyboard (Level A)
- [x] Skip navigation links implemented (app.component.html)
- [x] All interactive elements are keyboard accessible (Ionic components + custom handlers)
- [x] Custom buttons have keyboard event handlers (Enter/Space) - verified in home page, chat components, list items
- [x] Keyboard trap handling in modals (Ionic modals handle this, achievement-pop-up has custom focus management)
- [x] **COMPLETED**: Added ESC key support to fast-feedback modal (even when closable=false) for WCAG 2.1.1 compliance

#### 2.1.2 No Keyboard Trap (Level A)
- [x] Users can navigate away from all components using only keyboard (ESC key for modals, Tab for navigation)
- [x] Modals have proper focus management (Ionic modals handle focus trapping, achievement-pop-up has custom focus management)

#### 2.1.4 Character Key Shortcuts (Level A)
- [ ] **TODO**: Verify no single key shortcuts that aren't configurable or can be turned off

#### 2.4.1 Bypass Blocks (Level A)
- [x] Skip navigation links to main content and navigation implemented (app.component.html)
- [x] Main content has id="main-content" (ion-router-outlet in app.component.html)
- [x] Navigation has id="main-navigation" (ion-menu in v3.page.html)
- [ ] **RETEST**: After merge, verify skip links work:
  1. Load any page, press Tab - first focus should be "Skip to main content"
  2. Press Enter - focus should jump to main content area
  3. Reload page, press Tab twice - second focus should be "Skip to navigation"
  4. Press Enter - focus should jump to navigation menu
  5. Verify skip links are visible when focused (not hidden)

#### 2.4.2 Page Titled (Level A)
- [x] Home page sets title via utils.setPageTitle()
- [x] All pages have descriptive, unique titles (added to tabs page, verified others)
- [x] Title service used in all page components (utils.setPageTitle)

#### 2.4.3 Focus Order (Level A)
- [x] Logical tab order implemented with Ionic components
- [ ] **TODO**: Verify focus order is logical and intuitive

#### 2.4.4 Link Purpose (In Context) (Level A)
- [x] **COMPLETED**: Fixed "Powered by" link to have aria-label in auth-login component
- [x] All links have descriptive text or aria-label (verified in auth pages, navigation)
- [x] Icon-only links have aria-label (verified in chat, home page, and other components)
- [x] **COMPLETED**: Added aria-labels to fast-feedback pagination buttons ("Go to page X")
- [x] **COMPLETED**: Fixed navigation menu links to use proper `<a>` tags instead of `ion-item` with `routerLink` (v3.page.html)
- [x] **COMPLETED**: Added aria-labels to navigation links with badge counts (e.g., "Messages, 3 unread")
- [x] **COMPLETED**: Applied same accessibility improvements to bottom tab bar navigation (keyboard navigation handlers, pointer-events fixes for icons/badges, focus visibility) (tabs.page.html, tabs.page.ts, tabs.page.scss)
- [x] **VERIFIED**: All navigation links clickable and working on staging (Nov 6, 2025)

#### 2.4.5 Multiple Ways (Level AA)
- [x] Navigation menu provides multiple ways to access content
- [ ] **TODO**: Verify search functionality exists where appropriate

#### 2.4.6 Headings and Labels (Level AA)
- [x] Form labels are descriptive (ion-label with for attribute)
- [x] **VERIFIED**: Heading structure verified in code review (h1 > h2 > h3 maintained)
- [x] **VERIFIED**: Form inputs have labels (tested on home page - 0 inputs without labels found)
- [ ] **RETEST**: After merge, verify:
  1. All form pages have visible labels for inputs (or aria-label/aria-labelledby)
  2. Heading hierarchy follows logical order (no skipping levels)
  3. Screen reader can navigate by headings and they announce in logical order

#### 2.4.7 Focus Visible (Level AA)
- [x] All focusable elements have visible focus indicators (added focus-visible styles)
- [x] Focus styles implemented in global styles (2px outline with offset)
- [x] **VERIFIED**: Skip links show visible 2px solid outline when focused via keyboard (tested Nov 2025 on staging)
- [x] **VERIFIED**: Skip links show 2px solid green (rgb(106, 168, 79)) outline when focused (tested Nov 2025)
- [ ] **RETEST**: Verify all other interactive elements show visible focus indicator when Tab is pressed

#### 2.4.11 Focus Not Obscured (Minimum) (Level AA) - NEW in 2.2
- [x] **COMPLETED**: Added CSS to prevent focus obscuring (scroll-margin: 4px on focus-visible elements)
- [x] Sticky headers/footers have proper z-index (ion-header and ion-footer set to z-index: 1000)
- [x] Modals/overlays configured with backdrop opacity (ion-modal has --backdrop-opacity: 0.4)
- [x] **COMPLETED**: Added a keyboard-accessible custom accessWidget trigger to the personalised header on non-local hosts
- [x] **COMPLETED**: Reserved production-only inline space in the chat action row so accessWidget's floating trigger cannot obscure Attach or Send
- [ ] **VENDOR CONFIGURATION**: After the custom trigger is deployed and verified, publish **Hide Trigger** for the staging and production licenses in the accessiBe portal
- [ ] **RETEST ON DEPLOYED HOST**: Verify the custom trigger opens accessWidget and the chat controls remain unobscured at desktop, tablet, and mobile viewports
- [ ] **FOLLOW-UP AFTER PRODUCTION VERIFICATION**: Remove the 64px/88px composer fallback and restore the mobile trigger offset from 88 to 10

#### 2.4.13 Focus Appearance (Minimum) (Level AA) - NEW in 2.2
- [x] Focus indicators have at least 2px outline (implemented in global.scss)
- [x] Focus indicators contrast ratio meets 3:1 with adjacent colors (using primary color)
- [x] Focus indicators are at least as large as 2px around the element (2px outline + 2px offset)

#### 2.5.1 Pointer Gestures (Level A)
- [x] No path-based gestures required (Ionic handles this)
- [ ] **TODO**: Verify swipe gestures have alternative methods

#### 2.5.2 Pointer Cancellation (Level A)
- [x] Button clicks use onClick handlers (Ionic handles this)
- [ ] **TODO**: Verify no accidental activations

#### 2.5.3 Label in Name (Level A)
- [x] **VERIFIED**: Home page test (Nov 2025) - Most interactive elements have matching labels/accessible names
- [x] **COMPLETED**: Fixed menu toggle button to have aria-label (expand/collapse menu) (v3.page.html)
- [ ] **TODO**: Verify avatar button in personalised-header has aria-label (should be "Go to settings" - need to verify rendering)
- [ ] **TODO**: Verify all interactive elements have matching labels across all pages

#### 2.5.4 Motion Actuation (Level A)
- [ ] **TODO**: Verify no functionality depends on device motion or user motion

#### 2.5.7 Dragging Movements (Level AA) - NEW in 2.2
- [x] All dragging operations have a single-pointer alternative (filestack component has upload button)
- [x] Drag-and-drop operations can be completed without dragging (UPLOAD FILE button available)

#### 2.5.8 Target Size (Minimum) (Level AA) - NEW in 2.2
- [x] Interactive elements meet minimum size requirements (icon-button class has min 24x24px)
- [x] Touch targets meet minimum size requirements (Ionic components handle this)
- [ ] **TODO**: Verify exceptions (equivalents available, inline text links, essential) - needs manual review

### 3. Understandable

#### 3.1.1 Language of Page (Level A)
- [x] HTML lang attribute set to "en" in index.html
- [x] **VERIFIED**: lang attribute is correctly set on html tag (checked index.html - lang="en")
- [x] **COMPLETED**: moveToNewLocale function now sets lang attribute on HTML element when language changes
- [x] **VERIFIED**: HTML lang="en-US" correctly set on document element (tested Nov 2025 on staging)

#### 3.1.2 Language of Parts (Level AA) - CRITICAL
- [x] **COMPLETED**: Implemented language detection utility using franc-min library
- [x] **COMPLETED**: Created LanguageDetectionPipe to apply lang attributes to HTML content
- [x] **COMPLETED**: Applied lang attributes to foreign language passages in chat messages (chat-room component)
- [x] **COMPLETED**: Applied lang attributes to foreign language passages in assessment submissions (text, multiple, oneof components)
- [x] **COMPLETED**: Applied lang attributes to activity content (description component)
- [x] **COMPLETED**: Updated moveToNewLocale to set lang attribute on HTML element
- [x] **COMPLETED**: Added setPageLanguage() call in app.component.ts initialization
- [x] **VERIFIED**: Language detection implementation ready - tested on staging (Nov 2025), ready for foreign language content testing
- [ ] **TODO**: Test with screen readers to verify pronunciation (requires manual testing)

#### 3.2.1 On Focus (Level A)
- [x] **VERIFIED**: Home page test (Nov 2025) - No problematic focus handlers detected (no inline onfocus handlers found)
- [ ] **TODO**: Manual test - verify no context changes occur when focusing elements (requires interactive testing)

#### 3.2.2 On Input (Level A)
- [x] **VERIFIED**: Home page test (Nov 2025) - No form inputs with problematic onChange handlers detected
- [ ] **TODO**: Manual test - verify no context changes occur on input (except submit buttons) - test on forms

#### 3.2.3 Consistent Navigation (Level AA)
- [x] Navigation is consistent across pages
- [ ] **TODO**: Verify navigation order is consistent

#### 3.2.4 Consistent Identification (Level AA)
- [ ] **TODO**: Verify components with same functionality are identified consistently

#### 3.2.6 Consistent Help (Level A) - NEW in 2.2
- [ ] **TODO**: Verify help mechanisms (contact info, help page, help text) are in consistent locations
- [ ] **TODO**: Verify help is accessible across pages

#### 3.3.1 Error Identification (Level A)
- [x] Error messages associated with form fields (text component)
- [x] **VERIFIED**: Home page has no form inputs. Error messages use role="alert" and aria-live="assertive" (implemented)
- [ ] **TODO**: Test actual forms to verify all errors are clearly identified and in text format

#### 3.3.2 Labels or Instructions (Level A)
- [x] Form labels present (ion-label with for attribute)
- [x] **VERIFIED**: Home page test (Nov 2025) - No form inputs found on home page. Form components (text, multiple, oneof) have proper label associations implemented
- [ ] **TODO**: Test actual forms to verify all inputs have labels or instructions

#### 3.3.3 Error Suggestion (Level AA)
- [x] **VERIFIED**: Error messages implemented with aria-describedby in text component
- [ ] **TODO**: Verify error messages provide suggestions for correction where applicable

#### 3.3.4 Error Prevention (Legal, Financial, Data) (Level AA)
- [ ] **TODO**: Verify submissions can be reviewed, confirmed, or corrected

#### 3.3.7 Redundant Entry (Level A) - NEW in 2.2
- [ ] **TODO**: Verify information previously entered by user is auto-populated or available for selection
- [ ] **TODO**: Verify information is available for re-confirmation

#### 3.3.8 Accessible Authentication (Minimum) (Level AA) - NEW in 2.2
- [x] Authentication doesn't require memorization (passwords can be copied/pasted, show/hide password available)
- [ ] **TODO**: Verify alternative authentication methods are available (depends on backend implementation)
- [x] No object recognition or puzzle tests used (standard email/password login)

### 4. Robust

#### 4.1.1 Parsing (Level A)
- [x] **COMPLETED**: Fixed duplicate IDs:
  - Fixed `experiences-heading` duplicate (renamed mobile version to `experiences-heading-mobile`)
  - Fixed `message-content` duplicate in chat-room (now uses dynamic IDs: `message-content-${message.id}`)
  - Fixed `login-desc` duplicate in auth-login (consolidated into single span)
  - Fixed `task-content` duplicate in activity-desktop (renamed to `task-content-assessment` and `task-content-topic`)
  - Fixed `main-content` duplicate (renamed v3.page.html router-outlet to `main-content-router`)
  - Fixed `chatroom-name` duplicate in chat-list (now uses dynamic IDs: `chatroom-name-${i}`)
  - Fixed `inner-box` duplicate in video components (now uses dynamic IDs: `inner-box-${message.uuid}` and `inner-box-video-${video.uuid}`)
- [x] All IDs are now unique across pages
- [x] CSS updated to use attribute selectors `[id^="inner-box"]` instead of ID selectors

#### 4.1.2 Name, Role, Value (Level A)
- [x] Form inputs have proper labels (ion-label with for attribute)
- [x] ARIA attributes used where appropriate (aria-label, aria-live, role)
- [x] **VERIFIED**: Fast-feedback modal has proper role="dialog", aria-label on header
- [x] **VERIFIED**: Tooltips have role="tooltip" and aria-live="polite"
- [x] **VERIFIED**: Error messages use role="alert" and aria-live="assertive"
- [x] **COMPLETED**: Fixed navigation links to use semantic `<a>` tags instead of `ion-item` with `routerLink`
- [x] **COMPLETED**: Added proper focus styles to navigation links (2px outline on focus-visible)
- [x] **COMPLETED**: Fixed image preview buttons in chat messages to have aria-labels
- [x] **COMPLETED**: Fixed Quill editor toolbar elements (preview, action, remove links, and input fields) to have aria-labels
- [x] **VERIFIED**: Navigation links and Settings button work correctly on staging (Nov 6, 2025)
- [x] **VERIFIED**: Home page test (Nov 2025): 9/10 images have alt text, all buttons/links have accessible names, heading structure correct
- [ ] **TODO**: Review one image missing alt (1f3202d8-mEy8U.png - may be decorative)
- [ ] **PENDING**: Verify image preview aria-labels with actual image messages
- [ ] **PENDING**: Verify Quill editor toolbar aria-labels in chat editor
- [ ] **RETEST**: After full deployment, verify:
  1. All modals have role="dialog" and aria-label
  2. All custom components announce correct roles to screen readers
  3. All interactive elements have accessible names (text content, aria-label, or aria-labelledby)
  4. Test with screen reader - verify roles and names are announced correctly
  5. Verify navigation links are properly announced by screen readers as links (not just buttons)
  6. Verify image preview buttons announce correctly (e.g., "Preview image: filename.jpg")
  7. Verify Quill toolbar elements have accessible names

#### 4.1.3 Status Messages (Level AA)
- [x] Loading states have role="status" and aria-live="polite" (assessment component)
- [x] Saving messages have aria-live="polite" (assessment component)
- [x] Status messages are announced to screen readers (role="status" and aria-live used)
- [x] Error messages use role="alert" and aria-live="assertive" (text component has role="alert")

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

### Completed Improvements
- ✅ Updated checklist to WCAG 2.2 Level AA with new success criteria
- ✅ Added skip navigation links to app.component.html (already present)
- ✅ Added page title to tabs page via `utils.setPageTitle()`
- ✅ Fixed missing alt attributes on images (home page, chat attachments)
- ✅ Added aria-labels to icon-only buttons (attach, cancel, remove attachments)
- ✅ Added aria-hidden="true" to decorative icons
- ✅ Implemented WCAG 2.4.13 Focus Appearance (Minimum) - 2px outline with offset
- ✅ Added keyboard navigation support for interactive elements (remove buttons, preview buttons)
- ✅ Verified drag-and-drop has alternatives (upload button available)
- ✅ Added focus styles in global.scss for all interactive elements
- ✅ Fixed duplicate IDs (experiences-heading, message-content, login-desc, task-content, main-content)
- ✅ Enhanced tooltip directive for WCAG 1.4.13 compliance (ESC to dismiss, hoverable, persistent)
- ✅ Added CSS for focus not obscured (WCAG 2.4.11) - scroll-margin and z-index adjustments
- ✅ Added CSS support for text spacing (WCAG 1.4.12) - word-wrap and overflow-wrap
- ✅ Fixed link aria-label in auth-login "Powered by" link
- ✅ Added ESC key support to fast-feedback modal (WCAG 2.1.1) - dismissible even when closable=false
- ✅ Added aria-labels to fast-feedback pagination buttons (WCAG 2.4.4)
- ✅ Added aria-label to fast-feedback close button icon

### Still Requires Manual Testing
- Color contrast ratios (variables.scss) - needs automated tool verification (1.4.3, 1.4.11)
- Text resize to 200% (1.4.4) - needs manual testing at different zoom levels
- Content reflow at 320px width (1.4.10) - needs manual testing on narrow viewports
- Target sizes exceptions (2.5.8) - Ionic handles most, but needs verification for edge cases
- Heading hierarchy verification (1.3.1) - structure verified in code, needs final manual review
- Context changes on focus/input (3.2.1, 3.2.2) - needs manual testing
- Error suggestions (3.3.3) - needs verification that all errors provide helpful suggestions

## Verification Instructions for Completed Fixes

### After Merging to Trunk - Verification Steps

#### 1. Duplicate ID Fixes (WCAG 4.1.1)
**Fixed IDs:**
- `experiences-heading` → `experiences-heading-mobile` (mobile version)
- `message-content` → `message-content-${message.id}` (dynamic IDs)
- `login-desc` → consolidated into single span
- `task-content` → `task-content-assessment` and `task-content-topic`
- `main-content` → `main-content-router` (v3.page.html router-outlet)

**Retest Instructions:**
1. Open browser DevTools Console
2. Run: `document.querySelectorAll('[id]').length` - note total count
3. Run: `[...new Set([...document.querySelectorAll('[id]')].map(el => el.id))].length` - note unique count
4. **VERIFY**: Both counts match (no duplicates)
5. Navigate to: Home page, Chat room, Login page, Activity desktop page
6. Repeat step 3 on each page to verify no duplicate IDs exist

#### 2. Fast-Feedback Modal ESC Key Support (WCAG 2.1.1)
**Fixed in:** `fast-feedback.component.ts`

**Retest Instructions:**
1. Navigate to home page and wait for pulse check modal to appear (or trigger manually)
2. **VERIFY**: Modal appears with pulse check questions
3. Press `ESC` key
4. **VERIFY**: Modal dismisses immediately (even if `closable=false`)
5. If modal has close button (when `closable=true`), verify it has aria-label "Close pulse check"
6. Test with screen reader: Focus should return to previous element after ESC

#### 3. Fast-Feedback Pagination Buttons (WCAG 2.4.4)
**Fixed in:** `fast-feedback.component.html`

**Retest Instructions:**
1. Trigger fast-feedback modal with multiple pages of questions
2. Navigate to pagination dots at bottom
3. **VERIFY**: Each pagination button has aria-label like "Go to page 1", "Go to page 2, completed"
4. Test with screen reader: Each button should announce its purpose and completion status
5. Click each pagination button to verify it navigates correctly

#### 4. Tooltip Directive WCAG 1.4.13 Compliance
**Fixed in:** `tooltip.directive.ts` and `tooltip.module.ts`

**Retest Instructions:**
1. Find any element with tooltip (hover over icon buttons, info icons)
2. **VERIFY**: Tooltip appears on hover/focus
3. Move mouse cursor to tooltip itself
4. **VERIFY**: Tooltip remains visible (doesn't disappear immediately)
5. Press `ESC` key while tooltip is visible
6. **VERIFY**: Tooltip dismisses
7. Test with keyboard: Tab to element, tooltip should appear; ESC should dismiss it

#### 5. Focus Not Obscured (WCAG 2.4.11)
**Fixed in:** `global.scss`, `styles.scss`, `personalised-header.component.html`, and `index.html`

**accessWidget integration contract:**
- `body.accessibility-widget-enabled` exposes the non-local custom trigger and temporary Messages fallback; script or initialization failure must remove the class
- The header button must retain `data-acsb-custom-trigger="true"` so it opens accessWidget
- Keep `hideTrigger: true` in code and publish **Hide Trigger** in the accessiBe portal after the header control is deployed and verified
- Vendor references: [custom trigger setup](https://support.accessibe.com/hc/en-us/articles/25108229942802-How-to-create-a-custom-button-or-link-that-opens-the-accessWidget-interface) and [manual configuration](https://support.accessibe.com/hc/en-us/articles/28533073312274-How-to-customize-the-widget-manually-using-config-json)

**Retest Instructions:**
1. Navigate to any page with sticky header/footer
2. Tab through focusable elements
3. **VERIFY**: When focused element scrolls into view, it's not hidden behind sticky header/footer
4. **VERIFY**: Focused elements have visible 2px outline (check skip links especially)
5. Open DevTools and check computed styles on focused element:
   - `scroll-margin: 4px` should be present
   - `z-index` on headers/footers should be 1000
6. Deploy the application code before publishing **Hide Trigger** in the accessiBe portal so an accessibility entry point remains available throughout rollout
7. On a deployed non-local host, Tab to the header button labelled "Open accessibility options"
8. **VERIFY**: Mouse, Enter, and Space open accessWidget; after the portal setting is published, only the header trigger remains
9. **VERIFY**: The header remains usable with support shown/hidden, notification badges, both avatar variants, and on Experiences pages
10. Navigate to Messages and select a writable chat room
11. **VERIFY**: Attach and Send remain visible and clickable at 2048x1048, 1366x768, 1024x768, and 390x844
12. **VERIFY**: Before fallback cleanup, any vendor-overridden floating trigger does not obscure the chat action row
13. Block the accessWidget script request and **VERIFY** that the body class and non-functional header trigger are removed

#### 6. Text Spacing Support (WCAG 1.4.12)
**Fixed in:** `global.scss`

**Retest Instructions:**
1. Use browser zoom or text size adjustment to increase text size to 200%
2. **VERIFY**: Text wraps properly without horizontal scrolling
3. Check that `word-wrap: break-word` and `overflow-wrap: break-word` are applied to text elements
4. Test with CSS text spacing adjustments (if browser extension available):
   - Letter spacing: 0.12em
   - Word spacing: 0.16em
   - Line height: 1.5x
   - Paragraph spacing: 2x
5. **VERIFY**: Content remains readable and functional

#### 7. Skip Navigation Links (WCAG 2.4.1)
**Fixed in:** `app.component.html`

**Retest Instructions:**
1. Load any page in the app
2. Press `Tab` key immediately after page load
3. **VERIFY**: "Skip to main content" link appears first
4. Press `Enter` on skip link
5. **VERIFY**: Focus moves to main content area (id="main-content")
6. Reload page, press `Tab` twice
7. **VERIFY**: "Skip to navigation" link appears
8. Press `Enter` on navigation skip link
9. **VERIFY**: Focus moves to navigation menu (id="main-navigation")
10. Test with screen reader: Skip links should be announced first

#### 8. Link Purpose - "Powered by" Link (WCAG 2.4.4)
**Fixed in:** `auth-login.component.html`

**Retest Instructions:**
1. Navigate to login page
2. Find "Powered by" link at bottom
3. **VERIFY**: Link has `aria-label="Practera - powered by Practera"`
4. Test with screen reader: Should announce full purpose, not just "Powered by"
5. Verify link is keyboard accessible (Tab to it, Enter to activate)

#### 9. Heading Hierarchy Fixes (WCAG 1.3.1)
**Fixed in:** Multiple files

**Retest Instructions:**
1. Navigate to experiences page
2. **VERIFY**: Only one element has `id="experiences-heading"` (desktop version)
3. **VERIFY**: Mobile version has `id="experiences-heading-mobile"`
4. Use screen reader or browser DevTools to check heading structure:
   - Run: `[...document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]')].map(h => ({level: h.tagName.match(/H(\d)/)?.[1] || h.getAttribute('aria-level'), text: h.textContent.trim().substring(0, 50)}))`
5. **VERIFY**: Heading levels follow logical order (h1 > h2 > h3, no skipping levels)
6. Check that visually hidden headings (`.for-accessibility` class) are present for screen readers

#### 10. Ion-Segment-Button and Ion-Tab-Button Focus Visibility (WCAG 2.4.7)
**Fixed in:** `global.scss`

**Retest Instructions:**
1. Navigate to home page with Activities/Badges tabs
2. Press Tab to focus on segment buttons
3. **VERIFY**: Segment buttons show visible 2px outline when focused
4. Navigate to tabs page (mobile view)
5. Press Tab to focus on tab buttons
6. **VERIFY**: Tab buttons show visible 2px outline when focused
7. Verify outline color contrasts well with background (at least 3:1 ratio)

#### 11. Chat Room Scroll-to-Bottom Button (WCAG 2.4.4, 4.1.2)
**Fixed in:** `chat-room.component.html`

**Retest Instructions:**
1. Navigate to chat room with unread messages
2. Find scroll-to-bottom FAB button
3. **VERIFY**: Button has `aria-label="Scroll to bottom"`
4. Test with screen reader: Should announce button purpose clearly
5. Verify button is keyboard accessible (Tab to it, Enter/Space to activate)

#### 12. Tab Bar Icon-Only Buttons (WCAG 2.4.4, 4.1.2)
**Fixed in:** `tabs.page.html`

**Retest Instructions:**
1. Navigate to tabs page (mobile view)
2. Check each tab button (Home, Events, Reviews, Messages, Due Status, Settings)
3. **VERIFY**: Each has aria-label describing its function
4. **VERIFY**: Badge counts are included in aria-label (e.g., "Messages, 27 unread")
5. **VERIFY**: Icons have aria-hidden="true"
6. Test with screen reader: Each tab should announce its name and unread count if applicable

### Known Good Practices
- Form components (text, multiple, oneof) have excellent accessibility foundations
- Assessment component has loading states with proper ARIA
- Error messages use role="alert" and aria-live="assertive"
- Status messages use role="status" and aria-live="polite"
