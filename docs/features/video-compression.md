# video compression — ffmpeg wasm integration

## overview

the app uses [@ffmpeg/ffmpeg](https://github.com/ffmpegwasm/ffmpeg.wasm) v0.12.15 to compress videos client-side before upload, reducing upload time and storage costs. compression runs entirely in the browser via webassembly — no server-side processing required.

## architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    upload entry points                       │
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │ file-upload.component│    │ uppy-uploader.component     │ │
│  │  (assessment flow)   │    │  (chat attachment flow)     │ │
│  └────────┬────────────┘    └────────────┬────────────────┘ │
│           │                              │                  │
│           └──────────┬───────────────────┘                  │
│                      ▼                                      │
│           ┌──────────────────────┐                          │
│           │ UppyUploaderService  │                          │
│           │  createUppyInstance()│                          │
│           │  ┌────────────────┐  │                          │
│           │  │ file-added hook│──┼── intercepts video files │
│           │  └───────┬────────┘  │                          │
│           └──────────┼───────────┘                          │
│                      ▼                                      │
│           ┌──────────────────────┐                          │
│           │   FfmpegService      │                          │
│           │  ┌────────────────┐  │                          │
│           │  │ compressVideo()│  │                          │
│           │  └────────────────┘  │                          │
│           │  ┌────────────────┐  │                          │
│           │  │ loadFFmpeg()   │  │  lazy WASM load          │
│           │  └────────────────┘  │                          │
│           └──────────────────────┘                          │
│                      │                                      │
│                      ▼                                      │
│           ┌──────────────────────┐                          │
│           │ WASM assets          │                          │
│           │ assets/ffmpeg/       │                          │
│           │  ffmpeg-core.js      │                          │
│           │  ffmpeg-core.wasm    │                          │
│           │  worker.js           │                          │
│           └──────────────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

## dependencies

| package | version | purpose |
|---------|---------|---------|
| `@ffmpeg/ffmpeg` | 0.12.15 | javascript api wrapper |
| `@ffmpeg/core` | 0.12.10 | single-thread wasm build (~31 MB) |
| `@ffmpeg/util` | 0.12.2 | `fetchFile()` helper |

**note**: `@ffmpeg/core-mt` (multi-thread) is intentionally not installed — see [wasm audit](#wasm-audit) for rationale.

## key files

| file | purpose |
|------|---------|
| `projects/v3/src/app/services/ffmpeg.service.ts` | core service: load wasm, compress video |
| `projects/v3/src/app/components/uppy-uploader/uppy-uploader.service.ts` | shared uppy factory with compression interceptor |
| `projects/v3/src/app/components/uppy-uploader/uppy-uploader.component.ts` | modal uppy component (chat flow) |
| `projects/v3/src/app/components/file-upload/file-upload.component.ts` | inline uppy component (assessment flow) |
| `projects/v3/src/app/pages/devtool/devtool.page.ts` | developer testing page for compression |
| `projects/v3/src/assets/ffmpeg/` | wasm core, worker, and glue code assets |
| `angular.json` (lines 68-72) | asset copy config for ffmpeg files |

## compression strategy

### approach: intercept at uppy `file-added` event

when a video file is added to any uppy instance, the compression interceptor:

1. checks if the file is a video (by mime type)
2. applies size gating — skips compression for files < 5 MB or > limits
3. lazy-loads the ffmpeg wasm core (only on first video)
4. pauses the uppy upload queue
5. compresses the video with h.264/aac encoding
6. replaces the original file in uppy with the compressed version
7. resumes the upload queue

### compression parameters

| parameter | desktop | mobile | purpose |
|-----------|---------|--------|---------|
| `maxHeight` | 720 | 480 | scale output height (aspect preserved) |
| `crf` | 28 | 30 | quality factor (0-51, lower=better) |
| `preset` | `fast` | `ultrafast` | encoding speed |
| `audioBitrate` | `128k` | `96k` | aac audio bitrate |
| `movflags` | `+faststart` | `+faststart` | enables streaming playback |

### size gating

| condition | action |
|-----------|--------|
| file < 5 MB | skip compression (too small to benefit) |
| file > 200 MB (mobile) | refuse with user notification |
| file > 500 MB (desktop) | refuse with user notification |
| file is not `video/*` | skip compression |
| browser lacks wasm support | skip compression, upload original |

## integration points

### assessment file upload (`file-upload.component`)

- uses `UppyUploaderService.createUppyInstance('assessment', ...)` with inline dashboard
- compression hooks into the `files-added` event via the shared service
- user sees compression progress overlay before upload begins
- `autoProceed: false` provides natural window for compression

### chat attachment (`chat-room.component`)

- uses `UppyUploaderService.open('chat')` → opens `UppyUploaderComponent` modal
- modal's uppy instance gets the same compression interceptor
- flow: `attachmentSelectPopover()` → modal with compression → `addAttachment()` → `sendMessage()`

### devtool page

- standalone testing ui with file picker and progress bar
- shows before/after file sizes and compression ratio
- useful for verifying compression works on different devices/browsers

---

## wasm audit

### 1. current build: single-thread only

the installed `@ffmpeg/core` v0.12.10 is the **single-thread** build. this was a deliberate choice:

**why not multi-thread (`@ffmpeg/core-mt`)?**

| concern | detail |
|---------|--------|
| `SharedArrayBuffer` requirement | multi-thread needs `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers |
| ios safari | **does not support** `SharedArrayBuffer` in any stable release as of 2026 |
| deployment complexity | coop/coep headers break third-party embeds (analytics, chat widgets, oauth popups) |
| cdn/s3 hosting | header configuration varies by hosting platform, adds ops burden |

**single-thread tradeoffs:**

- ~2-3× slower than multi-thread on desktop
- adequate for videos < 200 MB on mobile, < 500 MB on desktop
- works on all modern browsers without special headers

### 2. mobile browser performance

| device tier | ~15s video | ~60s video | ~5min video |
|-------------|-----------|-----------|------------|
| high-end (iphone 14+, pixel 7+) | 8-15s | 30-60s | 3-5 min |
| mid-range (iphone 11, pixel 5) | 15-30s | 60-120s | 5-10 min |
| low-end (older android) | 30-60s | 2-4 min | not recommended |

**mobile-specific optimizations applied:**
- `ultrafast` preset (vs `fast` on desktop) — 2× speed gain, ~10% larger output
- lower resolution cap (480p vs 720p)
- lower audio bitrate (96k vs 128k)
- size gate at 200 MB (vs 500 MB desktop)

### 3. cross-browser compatibility

**minimum requirements:**
- `WebAssembly` support
- `BigInt64Array` support (used by emscripten glue code)

| browser | min version | notes |
|---------|------------|-------|
| chrome (desktop) | 67+ | full support |
| chrome (android) | 91+ | full support |
| firefox (desktop) | 68+ | full support |
| firefox (android) | 89+ | full support |
| safari (desktop) | 15+ | BigInt64Array requires safari 15 |
| safari (ios) | 15+ | BigInt64Array requires ios 15 |
| edge | 79+ | chromium-based, same as chrome |
| samsung internet | 15+ | chromium-based |
| opera | 54+ | chromium-based |

**not supported:**
- ie 11 (no wasm)
- safari < 15 (no BigInt64Array)
- ios < 15

### 4. wasm asset loading

assets are loaded lazily from `assets/ffmpeg/`:

```typescript
await this.ffmpeg.load({
  coreURL:        new URL('assets/ffmpeg/ffmpeg-core.js', window.location.origin).toString(),
  wasmURL:        new URL('assets/ffmpeg/ffmpeg-core.wasm', window.location.origin).toString(),
  classWorkerURL: new URL('assets/ffmpeg/worker.js', window.location.origin).toString(),
});
```

**asset sizes:**
- `ffmpeg-core.wasm`: ~31 MB (downloaded once, browser-cached)
- `ffmpeg-core.js`: ~200 KB (emscripten glue)
- `worker.js`: ~2 KB

**caching strategy:** the wasm file is loaded once and the `FFmpeg` instance is reused. subsequent compressions skip the load step entirely.

### 5. known limitations

1. **memory**: wasm heap limited to 2 GB. very large files (>500 MB) may cause oom on constrained devices.
2. **no hardware acceleration**: wasm cannot access gpu/videotoolbox — encoding is pure cpu.
3. **single-thread**: only uses one cpu core. multi-thread would help but requires coop/coep headers and drops ios support.
4. **asset duplication in angular.json**: both `node_modules/@ffmpeg/ffmpeg/dist/esm` and `projects/v3/src/assets/ffmpeg` are copied to output. the node_modules copy should be removed once local assets are confirmed stable.

## future improvements

| priority | improvement | effort |
|----------|-------------|--------|
| p1 | remove angular.json asset duplication | low |
| p2 | add feature flag to toggle compression | low |
| p3 | compression quality preview (thumbnail before/after) | medium |
| p4 | evaluate `@ffmpeg/core-mt` when ios safari adds SharedArrayBuffer | medium |
| p5 | webcodecs api as alternative for simple transcode (chrome 94+) | high |
