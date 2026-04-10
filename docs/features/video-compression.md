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

assets are loaded lazily from `assets/ffmpeg/` using `document.baseURI` as the base (not `window.location.origin`) to correctly resolve under locale-prefixed paths like `/en-US/`:

```typescript
await this.ffmpeg.load({
  coreURL:        new URL('assets/ffmpeg/ffmpeg-core.js', document.baseURI).toString(),
  wasmURL:        new URL('assets/ffmpeg/ffmpeg-core.wasm', document.baseURI).toString(),
  classWorkerURL: new URL('assets/ffmpeg/worker.js', document.baseURI).toString(),
});
```

**why `document.baseURI`?** the app is served under `<base href="/en-US/">` on staging/production. `window.location.origin` returns `https://app.p2-stage.practera.com` — missing the locale prefix — so asset requests 404 and the SPA returns `index.html` instead. `document.baseURI` respects the `<base>` tag and resolves to the correct path.

#### vendored worker.js

`projects/v3/src/assets/ffmpeg/worker.js` is a **vendored copy** of `node_modules/@ffmpeg/ffmpeg/dist/esm/worker.js` (v0.12.15). the upstream file has ES module `import` statements referencing `./const.js` and `./errors.js` — but angular's asset copy only copies the files we list in `angular.json`, not the full `dist/esm/` tree. when the worker is loaded as a standalone asset at `/en-US/assets/ffmpeg/worker.js`, those sibling modules don't exist at the serving path, so the worker silently fails and `ffmpeg.load()` hangs forever.

the fix: all dependencies from `const.js` and `errors.js` are inlined directly into `worker.js`. the file header documents the exact upstream version and which constants were inlined. **keep this in sync when upgrading `@ffmpeg/ffmpeg`.**

#### angular.json asset config

```json
{
  "glob": "**/*",
  "input": "node_modules/@ffmpeg/ffmpeg/dist/esm",
  "output": "./assets/ffmpeg"
},
"projects/v3/src/assets/ffmpeg"
```

the node_modules glob copies the upstream files first. then the local `projects/v3/src/assets/ffmpeg` directory is listed **after**, so its files (including the vendored `worker.js`) override the upstream versions. this is intentional — it provides a fallback for any new files added in future `@ffmpeg/ffmpeg` releases while ensuring the vendored worker takes priority.

**asset sizes:**
- `ffmpeg-core.wasm`: ~31 MB (downloaded once, browser-cached)
- `ffmpeg-core.js`: ~200 KB (emscripten glue)
- `worker.js`: ~2 KB

**caching strategy:** the wasm file is loaded once and the `FFmpeg` instance is reused. subsequent compressions skip the load step entirely (unless `terminate()` was called, in which case the next compression will lazy-load again).

### 5. known limitations

1. **memory**: wasm heap limited to 2 GB. very large files (>500 MB) may cause oom on constrained devices.
2. **no hardware acceleration**: wasm cannot access gpu/videotoolbox — encoding is pure cpu.
3. **single-thread**: only uses one cpu core. multi-thread would help but requires coop/coep headers and drops ios support.

---

## transcoding

`FfmpegService.transcodeToMp4(file)` converts any user-supplied video to h.264/aac mp4 without custom compression parameters. this is used when the goal is format normalization (e.g. `.webm` → `.mp4`) rather than size reduction. it uses the same lazy wasm load and exec timeout as `compressVideo()`.

---

## error handling

### exec timeout

all `ffmpeg.exec()` calls have a timeout:
- **desktop**: 10 minutes
- **mobile**: 5 minutes
- configurable via `CompressionOptions.timeout` (ms, -1 = unlimited)

if the timeout fires, ffmpeg throws and the preprocessor `catch` block uploads the original file uncompressed.

### compression cancellation (`cancelCompression`)

`UppyUploaderService.cancelCompression()` terminates the wasm worker mid-encode and resets all state:

```
cancelCompression() → ffmpegService.terminate() → progress$.next(null) → compressingUppy = null
```

called automatically from:
- `FileUploadComponent.ngOnDestroy()` — triggered by route navigation away from assessment
- `UppyUploaderComponent.ngOnDestroy()` — triggered by modal dismissal or route change

after termination, `FfmpegService` creates a fresh `FFmpeg` instance so the next compression starts cleanly.

### navigation guards

| scenario | protection |
|----------|------------|
| user clicks another task / browser back (angular route) | `SinglePageDeactivateGuard` — shows `window.confirm()` dialog, cancels compression if user confirms leave |
| user closes tab or reloads | `beforeunload` event listener on `UppyUploaderService` — browser shows native "leave page?" prompt |
| user swipe-dismisses modal (ionic gesture) | `canDismiss` on modal — returns `false` while `compressingUppy !== null` |
| modal dismissed programmatically (e.g. route forces modal stack clear) | `UppyUploaderComponent.ngOnDestroy()` calls `cancelCompression()` |

### subscription leak prevention

the progress subscription in `registerCompressionPreProcessor` uses `try/finally` to guarantee `sub.unsubscribe()` runs even if `compressVideo()` throws:

```typescript
const sub = ffmpegService.progress$.subscribe(...);
try {
  result = await ffmpegService.compressVideo(file);
} finally {
  sub.unsubscribe();
}
```

### graceful fallback

if compression fails for any reason (timeout, wasm crash, out of memory), the preprocessor `catch` block:
1. logs the error
2. nulls `compressingUppy`
3. emits `progress: null` to hide the overlay
4. lets uppy proceed with the **original uncompressed file**

the user is never blocked from uploading.

## future improvements

| priority | improvement | effort |
|----------|-------------|--------|
| p1 | add feature flag to toggle compression | low |
| p2 | compression quality preview (thumbnail before/after) | medium |
| p3 | evaluate `@ffmpeg/core-mt` when ios safari adds SharedArrayBuffer | medium |
| p4 | webcodecs api as alternative for simple transcode (chrome 94+) | high |
