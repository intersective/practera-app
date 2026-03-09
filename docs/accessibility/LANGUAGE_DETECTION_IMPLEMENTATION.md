# Language Detection Implementation Guide
## WCAG 2.2 Criterion 3.1.2 - Language of Parts (Level AA)

**Status:** Ready for Implementation  
**Priority:** HIGH - Required for full WCAG 2.2 Level AA compliance  
**Estimated Effort:** 3-5 days  
**Date:** November 6, 2025

---

## Overview

This document provides a complete implementation guide for adding language detection to the Practera App V3 to achieve full WCAG 2.2 Level AA compliance. This is the **only remaining "Partially Supports" item** at Level AA.

### Current Status
- **VPAT Status:** Partially Supports
- **Issue:** Foreign language text in user-generated content does not have `lang` attributes
- **Impact:** Screen readers use incorrect pronunciation for foreign language text

### Target Status
- **VPAT Status:** Supports
- **Solution:** Automatic language detection with `lang` attribute application
- **Benefit:** Screen readers pronounce foreign language text correctly

---

## Prerequisites

### Dependencies Installed
✅ `franc-min` - Lightweight language detection library (installed via npm)

```bash
npm install --save franc-min
```

### Files to Modify
1. `projects/v3/src/app/services/utils.service.ts` - Add language detection utility
2. `projects/v3/src/app/pipes/detect-language.pipe.ts` - Create Angular pipe (NEW FILE)
3. `projects/v3/src/app/pages/chat/chat-room/chat-room.component.html` - Apply to chat messages
4. `projects/v3/src/app/components/text/text.component.html` - Apply to submissions/feedback
5. `projects/v3/src/app/components/description/description.component.html` - Apply to descriptions
6. `docs/accessibility/WCAG_2.2_VPAT.md` - Update status to "Supports"

---

## Implementation Steps

### Step 1: Add Language Detection to UtilsService

**File:** `projects/v3/src/app/services/utils.service.ts`

Add the following import at the top:

```typescript
import { francAll } from 'franc-min';
```

Add the following method to the `UtilsService` class:

```typescript
/**
 * Detect the language of a text string and return ISO 639-1 code
 * @param text The text to analyze
 * @param minLength Minimum text length to attempt detection (default: 20)
 * @returns ISO 639-1 language code (e.g., 'es', 'fr', 'de') or null if English or undetermined
 */
detectLanguage(text: string, minLength: number = 20): string | null {
  // Don't detect for very short text (likely proper names or technical terms)
  if (!text || text.trim().length < minLength) {
    return null;
  }

  // Strip HTML tags for better detection
  const strippedText = text.replace(/<[^>]*>/g, '').trim();
  
  if (strippedText.length < minLength) {
    return null;
  }

  try {
    // Detect language using franc
    const detected = francAll(strippedText, { minLength: minLength });
    
    if (!detected || detected.length === 0) {
      return null;
    }

    // Get the most likely language (first result)
    const [langCode, confidence] = detected[0];

    // Only return if confidence is reasonable and not English
    // franc uses ISO 639-3 codes, we need to convert to ISO 639-1
    const iso6391Map = {
      'spa': 'es',  // Spanish
      'fra': 'fr',  // French
      'deu': 'de',  // German
      'ita': 'it',  // Italian
      'por': 'pt',  // Portuguese
      'jpn': 'ja',  // Japanese
      'zho': 'zh',  // Chinese
      'kor': 'ko',  // Korean
      'ara': 'ar',  // Arabic
      'rus': 'ru',  // Russian
      'hin': 'hi',  // Hindi
      'tha': 'th',  // Thai
      'vie': 'vi',  // Vietnamese
      'ind': 'id',  // Indonesian
      'msa': 'ms',  // Malay
      'nld': 'nl',  // Dutch
      'pol': 'pl',  // Polish
      'swe': 'sv',  // Swedish
      'dan': 'da',  // Danish
      'nor': 'no',  // Norwegian
      'fin': 'fi',  // Finnish
      // Add more as needed
    };

    // Don't mark English text
    if (langCode === 'eng') {
      return null;
    }

    // Convert to ISO 639-1 if mapping exists
    return iso6391Map[langCode] || null;
  } catch (error) {
    console.warn('Language detection error:', error);
    return null;
  }
}

/**
 * Wrap text with lang attribute if foreign language detected
 * @param text The text to wrap
 * @param minLength Minimum text length for detection
 * @returns Original text or text wrapped in span with lang attribute
 */
wrapWithLangAttribute(text: string, minLength: number = 20): string {
  const detectedLang = this.detectLanguage(text, minLength);
  
  if (detectedLang) {
    return `<span lang="${detectedLang}">${text}</span>`;
  }
  
  return text;
}
```

### Step 2: Create Angular Pipe for Language Detection

**File:** `projects/v3/src/app/pipes/detect-language.pipe.ts` (NEW FILE)

```typescript
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UtilsService } from '../services/utils.service';

@Pipe({
  name: 'detectLanguage',
  standalone: true
})
export class DetectLanguagePipe implements PipeTransform {
  constructor(
    private utils: UtilsService,
    private sanitizer: DomSanitizer
  ) {}

  transform(value: string, minLength: number = 20): SafeHtml {
    if (!value) {
      return value;
    }

    const wrappedText = this.utils.wrapWithLangAttribute(value, minLength);
    return this.sanitizer.sanitize(1, wrappedText) || value;
  }
}
```

### Step 3: Update Chat Room Component

**File:** `projects/v3/src/app/pages/chat/chat-room/chat-room.component.html`

**Before:**
```html
<quill-view-html [id]="'message-content-' + message.uuid"
  [content]="message?.message"
  [sanitize]="true"
  tabindex="0"
></quill-view-html>
```

**After:**
```html
<quill-view-html [id]="'message-content-' + message.uuid"
  [content]="message?.message | detectLanguage"
  [sanitize]="true"
  tabindex="0"
></quill-view-html>
```

**File:** `projects/v3/src/app/pages/chat/chat-room/chat-room.component.ts`

Add import:
```typescript
import { DetectLanguagePipe } from '../../../pipes/detect-language.pipe';
```

Add to imports array in @Component decorator:
```typescript
imports: [
  // ... existing imports
  DetectLanguagePipe
]
```

### Step 4: Update Text Component (Assessment Submissions)

**File:** `projects/v3/src/app/components/text/text.component.html`

**Before:**
```html
<p class="body-2 gray-3 white-space-pre black" [innerHTML]="submission?.answer"></p>
```

**After:**
```html
<p class="body-2 gray-3 white-space-pre black" [innerHTML]="submission?.answer | detectLanguage"></p>
```

**Before:**
```html
<p class="body-2 gray-3 white-space-pre" [class]="{'noanswer': !review?.answer}" [innerHTML]="review?.answer || 'No answer given to this optional question.'" i18n></p>
```

**After:**
```html
<p class="body-2 gray-3 white-space-pre" [class]="{'noanswer': !review?.answer}" [innerHTML]="(review?.answer || 'No answer given to this optional question.') | detectLanguage" i18n></p>
```

**File:** `projects/v3/src/app/components/text/text.component.ts`

Add import and to imports array (same as Step 3).

### Step 5: Update Description Component

**File:** `projects/v3/src/app/components/description/description.component.html`

**Before:**
```html
<div id="{{name}}" #description [innerHtml]="content"
  class="full-height"></div>
```

**After:**
```html
<div id="{{name}}" #description [innerHtml]="content | detectLanguage"
  class="full-height"></div>
```

Apply the same change to the other `innerHtml` binding in the template.

**File:** `projects/v3/src/app/components/description/description.component.ts`

Add import and to imports array (same as Step 3).

### Step 6: Update Language Switching

**File:** `projects/v3/src/app/services/utils.service.ts`

Find the `changeLanguage()` method and ensure it sets the `lang` attribute on the `<html>` element:

```typescript
changeLanguage(lang: string) {
  // ... existing code ...
  
  // Set lang attribute on html element for WCAG 3.1.1
  this.document.documentElement.setAttribute('lang', lang);
  
  // ... rest of existing code ...
}
```

### Step 7: Update Module Declarations (if using NgModules)

If the app uses NgModules instead of standalone components, add the pipe to the appropriate module:

**File:** `projects/v3/src/app/app.module.ts` or relevant feature module

```typescript
import { DetectLanguagePipe } from './pipes/detect-language.pipe';

@NgModule({
  declarations: [
    // ... existing declarations
    DetectLanguagePipe
  ],
  // ...
})
```

---

## Testing

### Automated Testing

1. **Unit Tests** - Create test file `detect-language.pipe.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { DetectLanguagePipe } from './detect-language.pipe';
import { UtilsService } from '../services/utils.service';
import { DomSanitizer } from '@angular/platform-browser';

describe('DetectLanguagePipe', () => {
  let pipe: DetectLanguagePipe;
  let utils: UtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UtilsService, DomSanitizer]
    });
    utils = TestBed.inject(UtilsService);
    const sanitizer = TestBed.inject(DomSanitizer);
    pipe = new DetectLanguagePipe(utils, sanitizer);
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should detect Spanish text', () => {
    const spanish = 'Hola, ¿cómo estás? Me llamo Juan y vivo en España.';
    const result = pipe.transform(spanish);
    expect(result).toContain('lang="es"');
  });

  it('should not wrap English text', () => {
    const english = 'Hello, how are you? My name is John and I live in England.';
    const result = pipe.transform(english);
    expect(result).not.toContain('lang=');
  });

  it('should not wrap short text', () => {
    const short = 'Hola';
    const result = pipe.transform(short);
    expect(result).not.toContain('lang=');
  });
});
```

2. **Run Tests:**
```bash
npm test
```

### Manual Testing with Screen Readers

#### Windows (NVDA)
1. Open chat page with foreign language messages
2. Enable NVDA
3. Navigate to foreign language message
4. **Expected:** NVDA switches voice/pronunciation for foreign language text
5. **Verify:** Text is pronounced correctly in the detected language

#### Mac (VoiceOver)
1. Open chat page with foreign language messages
2. Enable VoiceOver (Cmd + F5)
3. Navigate to foreign language message
4. **Expected:** VoiceOver switches voice/pronunciation for foreign language text
5. **Verify:** Text is pronounced correctly in the detected language

#### Test Cases
- [ ] Spanish text in chat messages
- [ ] French text in assessment submissions
- [ ] German text in activity descriptions
- [ ] Japanese text in feedback comments
- [ ] Mixed English and Spanish in same message
- [ ] Short text (< 20 characters) - should NOT be wrapped
- [ ] Proper names - should NOT be wrapped
- [ ] Technical terms - should NOT be wrapped

### Accessibility Audit Tools

1. **axe DevTools:**
   - Run audit on pages with foreign language content
   - Verify no new issues introduced
   - Check that `lang` attributes are properly applied

2. **WAVE:**
   - Scan pages with foreign language content
   - Verify `lang` attributes detected
   - Check for any warnings

---

## Edge Cases and Considerations

### 1. Short Text
- **Issue:** Short text (< 20 characters) may be proper names or technical terms
- **Solution:** Don't apply language detection to text shorter than 20 characters
- **Example:** "Juan" (proper name) vs "Juan vive en España" (Spanish sentence)

### 2. Mixed Language Content
- **Issue:** Single message may contain multiple languages
- **Solution:** Current implementation wraps entire text block - acceptable for WCAG
- **Future Enhancement:** Split text into sentences and detect each separately

### 3. False Positives
- **Issue:** Technical terms or proper names may be incorrectly detected
- **Solution:** Minimum length threshold reduces false positives
- **Example:** "API REST endpoint" should not be detected as a foreign language

### 4. Performance
- **Issue:** Language detection on every render may impact performance
- **Solution:** 
  - `franc-min` is lightweight and fast
  - Detection only runs on user-generated content (not UI text)
  - Consider caching results if performance issues arise

### 5. Supported Languages
- **Current:** Common languages (Spanish, French, German, Japanese, Chinese, etc.)
- **Extensible:** Add more language mappings to `iso6391Map` as needed

---

## Verification Checklist

Before marking as complete, verify:

- [ ] `franc-min` installed and imported correctly
- [ ] `detectLanguage()` method added to UtilsService
- [ ] `wrapWithLangAttribute()` method added to UtilsService
- [ ] `DetectLanguagePipe` created and working
- [ ] Chat messages apply language detection
- [ ] Assessment submissions apply language detection
- [ ] Activity descriptions apply language detection
- [ ] `changeLanguage()` sets `lang` on `<html>` element
- [ ] Unit tests pass
- [ ] Manual testing with NVDA shows correct pronunciation
- [ ] Manual testing with VoiceOver shows correct pronunciation
- [ ] No false positives for proper names/technical terms
- [ ] No performance degradation
- [ ] VPAT updated to "Supports" for 3.1.2

---

## Documentation Updates

After implementation, update:

1. **WCAG_2.2_VPAT.md:**
   - Change 3.1.2 from "Partially Supports" to "Supports"
   - Update remarks to describe implementation
   - Change overall conformance from "Partially Supports" to "Supports"

2. **WCAG_CHECKLIST.md:**
   - Mark 3.1.2 as completed
   - Add verification notes

3. **README or Developer Guide:**
   - Document language detection feature
   - Explain how to add new language mappings
   - Provide examples of usage

---

## Success Criteria

✅ **Implementation Complete When:**
1. All code changes implemented and tested
2. Unit tests pass
3. Screen reader testing confirms correct pronunciation
4. No false positives in common scenarios
5. VPAT updated to "Supports" for 3.1.2
6. Overall VPAT conformance level changed to "Supports"
7. Documentation updated

---

## Rollback Plan

If issues arise:

1. **Remove pipe from templates** - Revert template changes
2. **Keep utility methods** - May be useful for future enhancements
3. **Update VPAT** - Revert to "Partially Supports" with notes

---

## Future Enhancements

After initial implementation:

1. **Sentence-level detection** - Split text into sentences and detect each
2. **Caching** - Cache detection results to improve performance
3. **Manual override** - Allow content authors to manually specify language
4. **Whitelist** - Maintain whitelist of proper names/technical terms to exclude
5. **Confidence threshold** - Only apply `lang` if confidence above threshold

---

**Implementation Owner:** Frontend Development Team  
**Reviewer:** Accessibility Team  
**Target Completion:** Within 1 week  
**Priority:** HIGH - Blocks full WCAG 2.2 Level AA compliance



