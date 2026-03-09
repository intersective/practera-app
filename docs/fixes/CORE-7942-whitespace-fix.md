# CORE-7942: Whitespace Stripping Fix in Language Detection

## Problem Summary

When displaying HTML content with the `detectLanguage` pipe in description components, spaces between inline elements (like `<a>` tags) and adjacent text were being stripped, causing text to run together.

### Example
**API Response:**
```html
<a href="...">Privacy Policy</a> click here
```

**Rendered Output (BEFORE FIX):**
```
Privacy Policyclick here
```
(no space between "Policy" and "click")

**Expected Output (AFTER FIX):**
```
Privacy Policy click here
```
(space preserved)

## Root Cause Analysis

The issue was in the `addLanguageAttributes()` method in [utils.service.ts](projects/v3/src/app/services/utils.service.ts#L902-L945), which is called by the `detectLanguage` pipe for WCAG 3.1.2 Language of Parts compliance.

### Technical Details

When processing HTML content:
1. The DOM parser creates separate text nodes for text outside and between elements
2. For `<a>Privacy Policy</a> click here`, there are 2 text nodes:
   - Text node 1 (inside `<a>`): `"Privacy Policy"`
   - Text node 2 (after `<a>`): `" click here"` (with leading space)

### The Bug (Lines 919-925)

```typescript
const text = node.textContent?.trim() || '';  // ❌ Strips whitespace
if (text.length >= 10) {
  const detectedLang = this.detectLanguage(text, baseLang);
  if (detectedLang) {
    const span = this.document.createElement('span');
    span.setAttribute('lang', detectedLang);
    span.textContent = text;  // ❌ Uses trimmed text, losing leading/trailing spaces
    node.parentNode?.replaceChild(span, node);
  }
}
```

**What Happened:**
- Line 919: `node.textContent?.trim()` converted `" click here"` → `"click here"`
- Line 921: Length check: `"click here".length = 10` ✅ passes threshold
- Line 924: Assigned trimmed text to new span element
- Line 925: Replaced original node (with space) with span (without space)

**Result:** Space between "Policy" and "click" disappeared

## Solution Implemented

### 1. Preserve Original Whitespace

Changed line 924 to use `node.textContent` (original) instead of `text` (trimmed):

```typescript
const text = node.textContent?.trim() || '';  // ✅ Use for validation only
if (text.length >= 20) {
  const detectedLang = this.detectLanguage(text, baseLang);
  if (detectedLang) {
    const span = this.document.createElement('span');
    span.setAttribute('lang', detectedLang);
    span.textContent = node.textContent;  // ✅ Preserve original whitespace
    node.parentNode?.replaceChild(span, node);
  }
}
```

**Strategy:**
- Use `text` (trimmed) for validation and language detection logic
- Use `node.textContent` (original with whitespace) for rendering

### 2. Increase Minimum Length Threshold

Changed minimum length from **10** to **20** characters:

```typescript
// minimum text length for reliable detection (increased from 10 to 20 for better accuracy)
const minLength = 20;
```

**Benefits:**
1. **Better Accuracy**: Language detection algorithms are more reliable with longer text
2. **Avoid False Positives**: Short phrases like "click here" (10 chars) won't trigger detection
3. **Performance**: Reduces unnecessary processing of short text nodes
4. **WCAG Intent**: WCAG 3.1.2 is meant for substantial foreign language content, not individual words

## Impact Assessment

### Fixed Components
All components using the `detectLanguage` pipe will benefit:
- [description.component.html](projects/v3/src/app/components/description/description.component.html)
- [activity-desktop.component.html](projects/v3/src/app/desktop/activity-desktop/activity-desktop.component.html)
- [review-desktop.component.html](projects/v3/src/app/desktop/review-desktop/review-desktop.component.html)

### Edge Cases Considered
- **Text < 20 chars**: Not processed (preserves original spacing by default)
- **Multiple spaces**: Preserved exactly as in original HTML
- **Non-breaking spaces (`&nbsp;`)**: Preserved as HTML entities
- **Mixed content**: Works correctly with inline elements

## Testing Recommendations

1. **Visual Test**: Verify spacing appears correctly in description content with links
2. **Language Detection**: Confirm foreign language passages (>20 chars) still get `lang` attributes
3. **Short Text**: Verify short phrases (<20 chars) don't get incorrectly wrapped in `<span lang="...">`
4. **Regression**: Test existing descriptions with mixed English/foreign content

## Files Modified

- `/projects/v3/src/app/services/utils.service.ts`
  - Line 849: Increased `minLength` from 10 to 20
  - Lines 918-926: Added comments and fixed whitespace preservation in `addLanguageAttributes()`

## Related Tickets

- CORE-7942: Description WYSIWYG spacing fix
- Original accessibility implementation for WCAG 3.1.2 compliance
