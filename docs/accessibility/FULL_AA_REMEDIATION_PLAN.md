# Full WCAG 2.2 Level AA Remediation Plan

**Goal:** Achieve full "Supports" status for all WCAG 2.2 Level AA criteria  
**Current Status:** Partially Supports (Overall)  
**Target Status:** Supports (Full Compliance)  
**Date:** November 6, 2025

---

## Executive Summary

Currently, the VPAT shows "Partially Supports" as the overall conformance level due to several criteria that are marked as "Partially Supports". To achieve full WCAG 2.2 Level AA compliance, we need to remediate the following items:

### Level AA "Partially Supports" Items (CRITICAL)
1. **3.1.2 Language of Parts (Level AA)** - Partially Supports

### Level AAA "Partially Supports" Items (For Reference)
2. **1.4.8 Visual Presentation (Level AAA)** - Partially Supports
3. **3.3.6 Error Prevention (All) (Level AAA)** - Partially Supports

**Note:** Level AAA items are not required for WCAG 2.2 Level AA compliance, but are included for completeness.

---

## Critical Remediation Items (Level AA)

### 1. Language of Parts (3.1.2 - Level AA) - CRITICAL

**Current Status:** Partially Supports

**Issue:**
- Text phrases or passages in languages other than the default page language (en-US) do not have the `lang` attribute specified
- This affects screen readers' ability to pronounce text correctly in different languages
- User-generated content may contain text in multiple languages

**WCAG Requirement:**
> The human language of each passage or phrase in the content can be programmatically determined except for proper names, technical terms, words of indeterminate language, and words or phrases that have become part of the vernacular of the immediately surrounding text.

**Impact:**
- Screen readers will use incorrect pronunciation for foreign language text
- Affects users who rely on text-to-speech technology
- Required for WCAG 2.2 Level AA compliance

**Remediation Steps:**

#### Step 1: Audit Content for Multi-Language Text
- [ ] Review all static content for foreign language text
- [ ] Identify components that display user-generated content
- [ ] Identify components that display translated content
- [ ] Document all locations where multi-language text appears

**Files to Check:**
- All component templates (*.html)
- All content display components (chat, assessment, activity, etc.)
- Translation service (utils.ts, i18n)
- Rich text editor components (Quill editor)

#### Step 2: Implement Language Detection for User-Generated Content
- [ ] Add language detection library (e.g., `franc`, `languagedetect`)
- [ ] Create utility function to detect language of text passages
- [ ] Apply `lang` attribute to detected foreign language passages
- [ ] Handle edge cases (proper names, technical terms, mixed language)

**Implementation Example:**
```typescript
// utils.ts
import { franc } from 'franc';

export function detectAndMarkLanguage(text: string): string {
  const detectedLang = franc(text);
  if (detectedLang !== 'eng' && detectedLang !== 'und') {
    return `<span lang="${detectedLang}">${text}</span>`;
  }
  return text;
}
```

#### Step 3: Update Components to Apply Language Attributes
- [ ] Update chat message display to detect language
- [ ] Update assessment content display to detect language
- [ ] Update activity description display to detect language
- [ ] Update rich text editor output to preserve language attributes
- [ ] Update any component displaying user-generated content

**Files to Modify:**
- `chat-room.component.ts` / `chat-room.component.html`
- `assessment.component.ts` / `assessment.component.html`
- `activity.component.ts` / `activity.component.html`
- Any component using `[innerHTML]` binding with user content

#### Step 4: Handle Multi-Language Support in Translation System
- [ ] Ensure translation system sets `lang` attribute when switching languages
- [ ] Update `utils.changeLanguage()` to set `lang` on `<html>` element
- [ ] Test language switching with screen readers

**Implementation Example:**
```typescript
// utils.ts
changeLanguage(lang: string) {
  // Existing code...
  document.documentElement.setAttribute('lang', lang);
}
```

#### Step 5: Testing and Verification
- [ ] Test with screen readers (NVDA, JAWS, VoiceOver)
- [ ] Verify correct pronunciation of foreign language text
- [ ] Test with automated tools (axe DevTools, WAVE)
- [ ] Document test results

**Acceptance Criteria:**
- All foreign language passages have appropriate `lang` attribute
- Screen readers pronounce foreign language text correctly
- Language detection works for common languages (Spanish, French, German, Japanese, Chinese)
- Proper names and technical terms are not incorrectly marked
- Translation system correctly sets `lang` on `<html>` element

**Estimated Effort:** 2-4 hours (AI implementation)
**Priority:** HIGH (Required for Level AA)
**Implementation Approach:** AI will implement language detection automatically

---

## Additional Verification Items (Already "Supports" but Need Testing)

While these items are marked as "Supports", they have notes indicating they need verification or have known issues:

### 2. Contrast (Minimum) (1.4.3 - Level AA)

**Current Status:** Supports (with known issues)

**Known Issues:**
- JIRA: CORE-6313, CORE-6314, CORE-6315
- Some discrepancies found in color contrast

**Remediation Steps:**
- [ ] Review and fix CORE-6313 (specific contrast issue)
- [ ] Review and fix CORE-6314 (specific contrast issue)
- [ ] Review and fix CORE-6315 (specific contrast issue)
- [ ] Run automated contrast checker on all pages
- [ ] Document all color combinations used
- [ ] Ensure all text meets 4.5:1 ratio (small text) or 3:1 ratio (large text)

**Files to Check:**
- `variables.scss` - all color variables
- All component stylesheets
- Custom button styles
- Link styles
- Form input styles

**Estimated Effort:** 1-2 hours (AI implementation)
**Priority:** MEDIUM (Already marked "Supports" but has known issues)

### 3. Reflow (1.4.10 - Level AA)

**Current Status:** Supports (needs verification)

**Issue:**
- Requires verification that content reflows horizontally without requiring scrolling at 320px width

**Remediation Steps:**
- [ ] Test all pages at 320px viewport width
- [ ] Identify any horizontal scrolling issues
- [ ] Fix any content that doesn't reflow properly
- [ ] Test on actual mobile devices (iPhone SE, small Android phones)
- [ ] Document test results

**Testing Checklist:**
- [ ] Home page
- [ ] Messages/Chat page
- [ ] Events page
- [ ] Due Dates page
- [ ] Settings page
- [ ] Assessment pages
- [ ] Activity pages
- [ ] Login/Auth pages

**Estimated Effort:** 30-60 minutes (AI testing and fixes)
**Priority:** MEDIUM (Verification needed)

### 4. Non-text Contrast (1.4.11 - Level AA)

**Current Status:** Supports (needs verification)

**Issue:**
- Requires verification of UI components and graphical objects for 3:1 contrast ratio

**Remediation Steps:**
- [ ] Audit all UI components for contrast
- [ ] Check icon contrast against backgrounds
- [ ] Check button borders/outlines
- [ ] Check form input borders
- [ ] Check focus indicators
- [ ] Check graphical objects (charts, graphs, infographics)
- [ ] Document test results

**Components to Check:**
- All buttons (primary, secondary, tertiary)
- All form inputs (text, select, checkbox, radio)
- All icons (navigation, actions, status)
- All badges and status indicators
- All focus indicators
- All charts/graphs (if any)

**Estimated Effort:** 1-2 hours (AI testing and fixes)
**Priority:** MEDIUM (Verification needed)

---

## Implementation Plan

### Phase 1: Critical AA Compliance (2-4 hours)
**Goal:** Fix the one "Partially Supports" Level AA item

**AI Implementation Steps:**
1. **Language Detection Implementation (1-2 hours)**
   - Install language detection library (franc)
   - Create utility functions for language detection
   - Implement language detection for user-generated content
   - Handle edge cases (proper names, technical terms)

2. **Component Updates (30-60 minutes)**
   - Update all components displaying user-generated content
   - Update translation system to set lang attribute
   - Add language attributes to foreign language text
   - Test with automated tools

3. **Verification (30-60 minutes)**
   - Test with automated accessibility tools (axe DevTools, WAVE)
   - Verify language attributes are correctly applied
   - Document results

**Deliverable:** 3.1.2 Language of Parts changed from "Partially Supports" to "Supports"

### Phase 2: Verification and Known Issues (2-3 hours)
**Goal:** Verify all "Supports" items and fix known issues

**AI Implementation Steps:**
1. **Contrast Issues (1-2 hours)**
   - Review and fix CORE-6313, CORE-6314, CORE-6315
   - Run automated contrast checker
   - Fix any contrast violations found
   - Document all color combinations

2. **Reflow Testing (30-60 minutes)**
   - Test all pages at 320px width using browser DevTools
   - Fix any horizontal scrolling issues
   - Verify responsive design works correctly

3. **Non-text Contrast (30-60 minutes)**
   - Audit all UI components using automated tools
   - Fix any contrast issues found
   - Document results

4. **Final Verification (30 minutes)**
   - Run full accessibility audit with axe DevTools
   - Update VPAT to "Supports" overall
   - Document all changes

**Deliverable:** VPAT updated to "Supports" for WCAG 2.2 Level AA

### Phase 3: Documentation (30 minutes)
**Goal:** Document all changes

1. **Documentation:**
   - Update all accessibility documentation
   - Create developer guidelines for language attributes
   - Update VPAT with final results

**Deliverable:** Complete documentation of all accessibility fixes

---

## Testing Strategy

### Automated Testing
- **Tools:** axe DevTools, WAVE, Lighthouse
- **Frequency:** Run on every page/component
- **Focus:** Contrast, HTML validity, ARIA attributes, language attributes

### Manual Testing
- **Screen Readers:** NVDA (Windows), JAWS (Windows), VoiceOver (Mac/iOS)
- **Browsers:** Chrome, Firefox, Safari, Edge
- **Devices:** Desktop, tablet, mobile
- **Focus:** Language pronunciation, keyboard navigation, focus management

### User Testing
- **Participants:** Users with disabilities (screen reader users, keyboard-only users)
- **Scenarios:** Common user flows (login, navigate, read content, submit forms)
- **Focus:** Real-world usability and accessibility

---

## Success Criteria

### Level AA Compliance Achieved When:
1. ✅ All Level A criteria show "Supports"
2. ✅ All Level AA criteria show "Supports"
3. ✅ No "Partially Supports" for Level A or AA
4. ✅ All known issues resolved (CORE-6313, CORE-6314, CORE-6315)
5. ✅ All verification items tested and documented
6. ✅ VPAT updated to show "Supports" overall for WCAG 2.2 Level AA

### Specific Success Metrics:
- **3.1.2 Language of Parts:** All foreign language text has correct `lang` attribute
- **1.4.3 Contrast:** All text meets minimum contrast ratios (4.5:1 or 3:1)
- **1.4.10 Reflow:** All content reflows at 320px width without horizontal scrolling
- **1.4.11 Non-text Contrast:** All UI components meet 3:1 contrast ratio

---

## Risk Assessment

### High Risk
- **Language Detection Accuracy:** Automatic language detection may not be 100% accurate
  - **Mitigation:** Use well-tested library (franc), allow manual override, exclude short text

### Medium Risk
- **Performance Impact:** Language detection on large amounts of text may impact performance
  - **Mitigation:** Cache detection results, only detect on initial render, use web workers for large text

- **False Positives:** Proper names and technical terms may be incorrectly detected as foreign language
  - **Mitigation:** Maintain whitelist of common proper names/technical terms, set minimum text length

### Low Risk
- **Contrast Fixes:** Fixing contrast issues may require design changes
  - **Mitigation:** Work with design team, use color contrast tools, document all changes

---

## Resources Required

### AI Implementation
- AI coding assistant (automated implementation)
- Total estimated time: 4-7 hours for all phases

### Tools/Libraries
- Language detection library (franc - npm package, free)
- Contrast checking tools (already have axe DevTools, WAVE)
- Automated testing tools (browser DevTools, Lighthouse)

### Dependencies
- `franc` npm package for language detection (will be added automatically)

---

## Next Steps

1. **Immediate (Next Few Hours):**
   - [x] AI will implement language detection (3.1.2 Language of Parts)
   - [x] AI will update all components displaying user-generated content
   - [x] AI will verify language attributes are correctly applied

2. **Parallel Testing:**
   - [ ] AI will test contrast ratios (1.4.3)
   - [ ] AI will test reflow at 320px (1.4.10)
   - [ ] AI will test non-text contrast (1.4.11)
   - [ ] AI will fix any issues found

3. **Final Steps:**
   - [ ] Update VPAT to "Supports" for WCAG 2.2 Level AA
   - [ ] Document all changes in checklist

---

## Conclusion

Achieving full WCAG 2.2 Level AA compliance requires addressing **one critical "Partially Supports" item** (3.1.2 Language of Parts) and verifying/fixing several items that are already marked "Supports" but have known issues or need verification.

The primary focus is on implementing language detection for user-generated content, which is the only item preventing full Level AA compliance. **AI will implement this automatically** with an estimated effort of 2-4 hours for implementation and testing.

Once this is complete, the VPAT can be updated to show "Supports" for WCAG 2.2 Level AA overall, achieving full compliance.

**Note:** This plan is being executed by AI in parallel with testing checklist verification.

---

**Document Owner:** Accessibility Team  
**Last Updated:** November 6, 2025  
**Implementation Approach:** AI-assisted (minutes-hours, not days-weeks)

