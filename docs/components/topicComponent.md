# Topic Component - Video Playback Issues

## Issue: YouTube Video Overlay Not Loading on Subsequent Visits

### Problem Description
When users visit a topic task with an embedded YouTube video for the first time, the video loads and plays correctly with the Plyr overlay controls. However, when navigating away and returning to the same task (subsequent visit), the Plyr video overlay fails to load, leaving only the raw YouTube iframe without interactive controls.

### Root Cause Analysis

**Date Identified:** January 16, 2026
**Component:** `projects/v3/src/app/components/topic/topic.component.ts`
**Affected Files:**
- `topic.component.ts`
- `topic.component.html`

#### Technical Root Cause

The issue was caused by Angular's change detection not triggering DOM re-rendering when the same HTML content is set, combined with persistent state flags preventing re-initialization:

1. **First Visit Flow (Working):**
   - `ngOnChanges`: Sets `iframeHtml` via `embedService.embed()` with unique iframe ID
   - Template renders: `<div class="video-embed"><iframe id="youtube-embed-...-1768543203090"></iframe></div>`
   - `ngAfterViewChecked`: Queries `.video-embed`, finds it
   - Sets `plyrNeedsInit = false` and `plyrInitialized = true`
   - Calls `_initVideoPlayer()` successfully
   - Plyr wraps the element and adds controls ✅

2. **Subsequent Visit Flow (Broken):**
   - `ngOnChanges`: Calls `cleanupMedia()` to destroy old Plyr instance
   - `cleanupMedia()`: Destroys Plyr, sets `plyrInitialized = false`, sets `iframeHtml = null`
   - `ngOnChanges` continues: Sets `iframeHtml` to same HTML content (new iframe ID but same structure)
   - **Problem:** Angular's change detection sees identical HTML structure, doesn't re-render DOM
   - Template keeps old `.video-embed` div (now without Plyr wrapper after cleanup)
   - Old iframe is replaced with new iframe ID, but DOM structure unchanged
   - `ngAfterViewChecked`: Queries `.video-embed`
   - **Critical Issue:** Selector finds nothing (or finds stale element without proper structure)
   - Condition `if (videoEmbeds.length > 0)` fails
   - `_initVideoPlayer()` never called
   - Video remains without Plyr controls ❌

#### DOM Comparison

**First Visit HTML (Working):**
```html
<div class="video-embed">
  <iframe id="youtube-embed-QO3mTpdGzAk-1768543203090" src="https://www.youtube.com/embed/QO3mTpdGzAk"></iframe>
</div>
<!-- ngAfterViewChecked finds .video-embed, initializes Plyr -->
```

**Subsequent Visit HTML (Broken):**
```html
<div class="video-embed">
  <iframe id="youtube-embed-QO3mTpdGzAk-1768543271638" src="https://www.youtube.com/embed/QO3mTpdGzAk"></iframe>
</div>
<!-- ngAfterViewChecked queries .video-embed but finds empty NodeList -->
<!-- Angular didn't re-render because HTML content is structurally identical -->
```

**Key Observation:**
The iframe ID changes (timestamps differ), but Angular's change detection doesn't see this as a meaningful change since the overall HTML structure is identical. The `.video-embed` div element reference becomes stale after cleanup.

### Solution Implemented

The fix addresses the core issue: Angular not re-rendering the `.video-embed` div when the same HTML structure is set, preventing `ngAfterViewChecked` from finding the element on subsequent visits.

#### 1. Force DOM Re-rendering in ngOnChanges
Added explicit change detection trigger to force Angular to clear and re-render the iframe container:

```typescript
ngOnChanges(changes: SimpleChanges): void {
  this.continuing = false;
  if (this.topic && changes.topic) {
    // clean up previous video player instance before loading new topic
    if (changes.topic.previousValue) {
      this.cleanupMedia();
      
      // force template to clear by setting null and triggering change detection
      // this ensures angular removes the old .video-embed div completely
      this.iframeHtml = null;
      this.cdr.detectChanges();  // ⭐ KEY FIX: Forces Angular to remove old DOM
    }
    
    // reset state for new topic
    this.videoNeedsInit = false;
    this.plyrNeedsInit = false;
    this.plyrInitialized = false;

    if (this.topic.videolink) {
      // this may set iframeHtml for youtube/vimeo embeds
      this._setVideoUrlElelemts();
      
      // for native videos or iframe embeds, mark for init
      if (!this.iframeHtml) {
        this.videoSrc = this.topic.videolink;
        this.videoNeedsInit = true;
      } else {
        this.videoSrc = null;
        this.plyrNeedsInit = true;
      }
    }
  }
}
```

**Why this works:**
- Setting `iframeHtml = null` triggers template's `*ngIf="iframeHtml"` to become false
- Calling `cdr.detectChanges()` forces Angular to process this change immediately
- Template removes the entire `<div class="video-embed">` from DOM
- When `_setVideoUrlElelemts()` sets new `iframeHtml`, it's a fresh insertion
- Angular re-renders the `.video-embed` div from scratch
- `ngAfterViewChecked` now finds the element and initializes Plyr successfully

#### 2. Enhanced cleanupMedia() with Proper Flag Reset
Updated to reset both initialization flags, ensuring clean state for next render:

```typescript
public cleanupMedia() {
  this._pauseResetAndReplaceMediaElements('audio');
  this._pauseResetAndReplaceMediaElements('video');

  // destroy and remove all plyr instances
  const plyrElements = this.document.querySelectorAll('.plyr');
  this.utils.each(plyrElements, (plyrEl: HTMLElement) => {
    if ((plyrEl as any).plyr) {
      try {
        (plyrEl as any).plyr.destroy();
      } catch (e) {
        console.warn('error destroying plyr instance:', e);
      }
      (plyrEl as any).plyr = null;
    }
  });

  // reset plyr initialization flags to allow re-initialization
  this.plyrInitialized = false;
  this.plyrNeedsInit = false;  // ⭐ Also reset this flag

  // nullify iframehtml reference for garbage collection
  this.iframeHtml = null;
}
```

#### 3. Add Duplicate Check in _initVideoPlayer
Prevent double initialization if Plyr wrapper somehow already exists:

```typescript
private _initVideoPlayer() {
  const embedVideos = this.document.querySelectorAll('.video-embed');

  this.utils.each(embedVideos, (embedVideo, index) => {
    // skip native video elements
    if (embedVideo.nodeName === 'VIDEO') {
      return;
    }

    // skip if already has plyr wrapper to prevent double initialization
    if (embedVideo.parentElement?.classList.contains('plyr')) {
      return;  // ⭐ Safety check
    }

    // initialize Plyr...
    const plyrInstance = new Plyr(embedVideo as HTMLElement, {
      // ...config
    });

    // store plyr instance reference for cleanup
    (embedVideo as any).plyr = plyrInstance;  // ⭐ Store for cleanup
    
    // remove poster overlay that blocks video interaction
    const removePoster = () => {
      const wrapper = embedVideo.parentElement;
      const poster = wrapper?.querySelector('.plyr__poster');
      if (poster) {
        poster.remove();
      }
    };

    setTimeout(removePoster, 100);
    plyrInstance.on('ready', removePoster);
    plyrInstance.on('playing', removePoster);
  });
}
```

#### 4. Lifecycle Flow After Fix

**Working Flow (Subsequent Visits):**
1. User navigates to same topic again
2. `ngOnChanges`: Detects `changes.topic.previousValue` exists
3. Calls `cleanupMedia()`: Destroys Plyr, resets all flags
4. Sets `iframeHtml = null` 
5. Calls `cdr.detectChanges()`: Angular removes `.video-embed` div from DOM ⭐
6. Continues: Sets `plyrNeedsInit = false`, `plyrInitialized = false`
7. Calls `_setVideoUrlElelemts()`: Creates new iframe HTML
8. Sets `iframeHtml` with new content
9. Angular's automatic change detection sees new value
10. Template renders fresh `<div class="video-embed">` with new iframe ⭐
11. `ngAfterViewChecked`: Queries `.video-embed`
12. **Success:** Finds the freshly rendered element! ✅
13. Sets flags and calls `_initVideoPlayer()`
14. Plyr initializes successfully with controls

### Implementation Details

**Key Changes in `topic.component.ts`:**

1. **Added ChangeDetectorRef Injection:**
   ```typescript
   constructor(
     // ...other services
     private cdr: ChangeDetectorRef,
     @Inject(DOCUMENT) private readonly document: Document
   ) { }
   ```

2. **Enhanced `ngOnChanges` with Forced Change Detection:**
   ```typescript
   if (changes.topic.previousValue) {
     this.cleanupMedia();
     
     // ⭐ Force DOM clearing
     this.iframeHtml = null;
     this.cdr.detectChanges();  // Critical for re-rendering
   }
   ```

3. **Updated `cleanupMedia` to Reset Both Flags:**
   ```typescript
   this.plyrInitialized = false;
   this.plyrNeedsInit = false;  // Added: was missing before
   ```loads Plyr overlay
- [x] Subsequent visits to SAME task loads Plyr overlay correctly
- [x] Switching between different video tasks works
- [x] Native video elements (non-YouTube) still work
- [x] Vimeo embeds work correctly
- [x] No console errors related to Plyr initialization
- [x] Video controls are fully interactive on all visits
- [x] Cleanup properly destroys old Plyr instances

**Loading Indicators (Added January 16, 2026):**
- [ ] Skeleton loader appears immediately when navigating to topic with video
- [ ] Skeleton has correct 16:9 aspect ratio (400px mobile, 450px desktop)
- [ ] Skeleton disappears when YouTube/Vimeo embed finishes Plyr initialization
- [ ] Skeleton disappears when native video triggers `canplay` event
- [ ] Fade-in animation plays smoothly after skeleton disappears (300ms)
- [ ] Skeleton clears on video error (test with invalid video URL)
- [ ] No flash of unstyled content between skeleton and video
- [ ] Skeleton has proper ARIA attributes (`role="status"`, `aria-label`)
- [ ] Loading state doesn't get stuck (test rapid navigation between topics)

**Poster Behavior (Updated January 16, 2026):**
- [x] No poster overlay blocks video interaction (Plyr `poster: false` config)
- [x] No console errors about poster removal
- [x] Video plays immediately on click without poster interference

### Debugging Tips

**Check if .video-embed exists in DOM:**
```typescript
ngAfterViewChecked(): void {
  if (this.plyrNeedsInit && !this.plyrInitialized) {
    const videoEmbeds = this.document.querySelectorAll('.video-embed');
    console.log('Looking for .video-embed, found:', videoEmbeds.length);
    if (videoEmbeds.length > 0) {
      // initialization happens...
    }
  }
}
```

**Common Issue Indicators:**
- `videoEmbeds.length === 0` on subsequent visits → Angular not re-rendering
- Plyr wrapper exists but no controls → Plyr initialized but not cleaned up properly
- Multiple Plyr instances on same video → Duplicate initialization, missing safety check
- iframe ID changes but video doesn't work → Template not detecting changes
- Skeleton loader stuck visible → `isVideoLoading` not cleared, check `ngAfterViewChecked`, `onVideoCanPlay`, or `handleVideoError`
- Video appears without fade-in → Check `[@fadeIn]` animation in template

**Verification:**
1. Open developer console
2. Navigate to topic with video → Should see skeleton, then Plyr controls with fade-in
3. Navigate away to another task
4. Return to same video task → Should see skeleton again, then Plyr controls with fade-in
5. Check HTML: `.video-embed` should exist and iframe ID should be different
6. Test error case with invalid video URL → Skeleton should disappear and show error alert

### Console Output

**Expected behavior:**
- Skeleton loader appears while video initializes
- For YouTube/Vimeo: Skeleton visible during iframe load and Plyr initialization
- For native videos: Skeleton visible until `canplay` event fires
- Fade-in animation (300ms) when video becomes visible
- No console errors related to Plyr or poster removal

### Key Learnings

### Files Modified

1. `projects/v3/src/app/components/topic/topic.component.ts`
   - Added `ChangeDetectorRef` injection
   - Added Angular animation imports (`trigger`, `transition`, `style`, `animate`)
   - Added `fadeIn` animation trigger to component decorator
   - Added public `isVideoLoading` flag for loading state management
   - Updated `ngOnChanges`: Added `cdr.detectChanges()` call after setting `iframeHtml = null`, sets `isVideoLoading = true` when video detected
   - Enhanced `cleanupMedia()`: Reset both `plyrInitialized` and `plyrNeedsInit` flags
   - Updated `_initVideoPlayer()`: Added duplicate check, instance storage, removed manual poster removal code (replaced with CSS)
   - Updated `ngAfterViewChecked()`: Clears `isVideoLoading` after Plyr initialization
   - Updated `onVideoCanPlay()`: Clears `isVideoLoading` when native video is ready
   - Updated `handleVideoError()`: Clears `isVideoLoading` on error to prevent stuck state

2. `projects/v3/src/app/components/topic/topic.component.html`
   - Added skeleton loader with `*ngIf="isVideoLoading"`, `role="status"`, and `aria-label="Loading video"` for accessibility
   - Updated iframe embed: Added `*ngIf="!isVideoLoading"` and `[@fadeIn]` animation
   - Updated native video: Added `*ngIf="!isVideoLoading"` condition and `[@fadeIn]` animation

3. `projects/v3/src/app/components/topic/topic.component.scss`
   - Added `.video-skeleton` styles (width: 100%, margin: 20px)
   - Added `.video-skeleton-box` styles (400px height mobile, 450px desktop, 8px border-radius)
   - Added CSS rule to hide Plyr poster overlay: `::ng-deep .plyr__poster { display: none !important; }`
   - Added media query for desktop skeleton sizing

### Key Learnings

1. **Angular Change Detection with [innerHTML]:**
   - Setting `[innerHTML]` to the same HTML structure won't trigger re-render
   - Must explicitly set to `null` first, then call `detectChanges()`
   - This forces template's `*ngIf` to evaluate and remove/re-add the element

2. **Plyr State Management:**
   - Destroying Plyr instance doesn't automatically reset component state flags
   - Both `plyrInitialized` and `plyrNeedsInit` must be reset for re-initialization
   - Storing instance reference on element helps with cleanup and duplicate detection
   - **CSS-based poster hiding** (`::ng-deep .plyr__poster { display: none !important; }`) is more reliable than config or DOM manipulation

3. **Lifecycle Hook Coordination:**
   - `ngOnChanges` handles cleanup and state reset
   - `ngAfterViewChecked` handles detection and initialization
   - Both must work together for proper re-initialization flow

4. **Loading State Management:**
   - Boolean flag (`isVideoLoading`) provides simple state tracking
   - Set true when video detected, clear on ready/error events
   - Skeleton loader consistent with codebase patterns (ion-skeleton-text)
   - Proper accessibility: `role="status"` and internationalized `aria-label`

5. **User Experience Enhancements:**
   - Fade-in animations (300ms) provide polished transitions
   - 16:9 aspect ratio skeleton prevents layout shift
   - Responsive skeleton sizing (400px mobile, 450px desktop)
   - Error handling prevents stuck loading state

### Future Improvements

**Completed Improvements (January 16, 2026):**

1. ✅ **Plyr Poster Configuration**
   - Replaced manual poster removal workaround with CSS-based solution
   - Added `::ng-deep .plyr__poster { display: none !important; }` in component styles
   - Cleaner, more maintainable approach that works reliably across Plyr versions
   - Note: Plyr's TypeScript interface doesn't include a `poster` config option, so CSS is the recommended approach

2. ✅ **Loading Indicator Implementation**
   - Added `isVideoLoading` flag for state management
   - Implemented skeleton loader consistent with existing codebase patterns
   - 16:9 aspect ratio placeholder (400px mobile, 450px desktop)
   - Proper accessibility: `role="status"` and internationalized `aria-label`
   - Added fade-in animation (300ms ease-in) for smooth video appearance
   - Loading state clears on video ready (`canplay` for native, after Plyr init for embeds)
   - Error handling: Loading state clears in `handleVideoError()` to prevent stuck state

**Remaining Future Improvements:**

1. Consider using structural directives with `trackBy` for better change detection
2. Add comprehensive error handling for Plyr initialization failures
3. Consider moving Plyr logic to a dedicated service for reusability
4. Add unit tests for cleanup and re-initialization scenarios
5. Add unit tests for loading state lifecycle

### References

   - Angular Change Detection: https://angular.io/guide/change-detection
   - ChangeDetectorRef API: https://angular.io/api/core/ChangeDetectorRef
   - Plyr.js Documentation: https://github.com/sampotts/plyr
   - Added `#topicVideo` template reference for ViewChild
   - Updated video element conditional rendering

### References

- Plyr.js Documentation: https://github.com/sampotts/plyr
- YouTube Iframe API: https://developers.google.com/youtube/iframe_api_reference
- Angular Lifecycle Hooks: https://angular.io/guide/lifecycle-hooks
