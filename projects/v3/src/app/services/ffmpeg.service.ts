import { Injectable, NgZone } from '@angular/core';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { Subject } from 'rxjs';

export interface CompressionOptions {
  /** max output height in pixels (maintains aspect ratio) */
  maxHeight?: number;
  /** h.264 crf quality: 0-51, lower = better quality */
  crf?: number;
  /** encoding speed preset */
  preset?: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow';
  /** audio bitrate */
  audioBitrate?: string;
  /** exec timeout in milliseconds (-1 = unlimited) */
  timeout?: number;
}

export interface CompressionProgress {
  /** encoding progress 0-1 */
  progress: number;
  /** processed duration in microseconds */
  timeUs: number;
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  reductionPercent: number;
  skipped: boolean;
  skipReason?: string;
}

export interface VideoMetadata {
  width: number;
  height: number;
  durationSec: number;
}

/** max time to wait for browser metadata probe (seconds) */
const PROBE_TIMEOUT_SEC = 5;

/** min file size worth compressing (5 MB) */
const MIN_COMPRESS_SIZE = 5 * 1024 * 1024;
/** max file size on mobile (200 MB) */
const MAX_MOBILE_SIZE = 200 * 1024 * 1024;
/** max file size on desktop (500 MB) */
const MAX_DESKTOP_SIZE = 500 * 1024 * 1024;
/** default exec timeout: 10 min desktop, 5 min mobile */
const DESKTOP_TIMEOUT_MS = 10 * 60 * 1000;
const MOBILE_TIMEOUT_MS = 5 * 60 * 1000;

@Injectable({
  providedIn: 'root',
})
export class FfmpegService {
  private ffmpeg: FFmpeg;
  private isLoaded = false;

  readonly progress$ = new Subject<CompressionProgress>();
  readonly log$ = new Subject<string>();

  constructor(private ngZone: NgZone) {
    this.ffmpeg = new FFmpeg();
  }

  isFfmpegLoaded(): boolean {
    return this.isLoaded;
  }

  /** terminate the wasm worker and reset state so a fresh load can happen */
  terminate(): void {
    try {
      this.ffmpeg.terminate();
    } catch { /* already terminated or never loaded */ }
    this.isLoaded = false;
    this.ffmpeg = new FFmpeg();
  }

  /** default exec timeout based on device type */
  private getDefaultTimeout(): number {
    return this.isMobile() ? MOBILE_TIMEOUT_MS : DESKTOP_TIMEOUT_MS;
  }

  /** detect if the current device is mobile */
  isMobile(): boolean {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  /** check if browser supports wasm and BigInt64Array (required by ffmpeg core) */
  isSupported(): boolean {
    return typeof WebAssembly !== 'undefined' && typeof BigInt64Array !== 'undefined';
  }

  /** get device-appropriate compression defaults */
  getDevicePresets(): CompressionOptions {
    if (this.isMobile()) {
      return { maxHeight: 480, crf: 30, preset: 'ultrafast', audioBitrate: '96k' };
    }
    return { maxHeight: 720, crf: 28, preset: 'fast', audioBitrate: '128k' };
  }

  /** check if a file should be compressed (size gating) */
  shouldCompress(file: File): { compress: boolean; reason?: string } {
    if (!file.type.startsWith('video/')) {
      return { compress: false, reason: 'not a video file' };
    }
    if (!this.isSupported()) {
      return { compress: false, reason: 'browser does not support wasm or BigInt64Array' };
    }
    if (file.size < MIN_COMPRESS_SIZE) {
      return { compress: false, reason: 'file too small to benefit from compression' };
    }
    const maxSize = this.isMobile() ? MAX_MOBILE_SIZE : MAX_DESKTOP_SIZE;
    if (file.size > maxSize) {
      return { compress: false, reason: `file exceeds ${this.isMobile() ? '200' : '500'} MB limit` };
    }
    return { compress: true };
  }

  async loadFFmpeg(): Promise<void> {
    if (this.isLoaded) {
      return;
    }

    this.ffmpeg.on('log', ({ message }) => {
      this.log$.next(message);
    });

    this.ffmpeg.on('progress', ({ progress, time }) => {
      this.ngZone.run(() => this.progress$.next({ progress, timeUs: time }));
    });

    await this.ffmpeg.load({
      coreURL: new URL('assets/ffmpeg/ffmpeg-core.js', document.baseURI).toString(),
      wasmURL: new URL('assets/ffmpeg/ffmpeg-core.wasm', document.baseURI).toString(),
      classWorkerURL: new URL('assets/ffmpeg/worker.js', document.baseURI).toString(),
    });

    this.isLoaded = true;
  }

  /** extract width, height, and duration from a video file using a temporary <video> element */
  private probeMetadata(file: File): Promise<VideoMetadata | null> {
    return new Promise(resolve => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';

      const cleanup = () => {
        URL.revokeObjectURL(url);
        video.removeAttribute('src');
        video.load();
      };

      const timer = window.setTimeout(() => {
        cleanup();
        resolve(null);
      }, PROBE_TIMEOUT_SEC * 1000);

      video.onloadedmetadata = () => {
        clearTimeout(timer);
        const { videoWidth, videoHeight, duration } = video;
        cleanup();
        if (!videoWidth || !videoHeight || !isFinite(duration)) {
          resolve(null);
          return;
        }
        resolve({ width: videoWidth, height: videoHeight, durationSec: duration });
      };

      video.onerror = () => {
        clearTimeout(timer);
        cleanup();
        resolve(null);
      };

      video.src = url;
    });
  }

  /** compress a video file with size gating and device-aware presets */
  async compressVideo(file: File, options: CompressionOptions = {}): Promise<CompressionResult> {
    const check = this.shouldCompress(file);
    if (!check.compress) {
      return {
        file,
        originalSize: file.size,
        compressedSize: file.size,
        reductionPercent: 0,
        skipped: true,
        skipReason: check.reason,
      };
    }

    const defaults = this.getDevicePresets();
    const {
      maxHeight = defaults.maxHeight,
      crf = defaults.crf,
      preset = defaults.preset,
      audioBitrate = defaults.audioBitrate,
      timeout = this.getDefaultTimeout(),
    } = options;

    const metadata = await this.probeMetadata(file);

    if (!this.isLoaded) {
      await this.loadFFmpeg();
    }

    // sanitize filename for virtual fs
    const inputName = 'input_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const outputName = 'compressed_' + Date.now() + '.mp4';

    // only scale when the source is taller than the target height
    const needsScale = !metadata || metadata.height > (maxHeight ?? 0);

    const ffmpegArgs = ['-i', inputName];
    if (needsScale) {
      ffmpegArgs.push('-vf', `scale=-2:${maxHeight}`);
    }
    ffmpegArgs.push(
      '-c:v', 'libx264',
      '-crf', String(crf),
      '-preset', preset,
      '-c:a', 'aac',
      '-b:a', audioBitrate,
      '-movflags', '+faststart',
      outputName,
    );

    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    await this.ffmpeg.exec(ffmpegArgs, timeout);

    const fileData = await this.ffmpeg.readFile(outputName);
    const blob = new Blob([fileData as ArrayBuffer], { type: 'video/mp4' });
    const compressedFile = new File([blob], outputName, { type: 'video/mp4' });

    // clean up virtual fs to free memory
    try { await this.ffmpeg.deleteFile(inputName); } catch { /* already removed */ }
    try { await this.ffmpeg.deleteFile(outputName); } catch { /* already removed */ }

    const reductionPercent = Math.round((1 - compressedFile.size / file.size) * 100);

    return {
      file: compressedFile,
      originalSize: file.size,
      compressedSize: compressedFile.size,
      reductionPercent,
      skipped: false,
    };
  }

  /** transcode any user-supplied video file to mp4 using h.264/aac */
  async transcodeToMp4(file: File): Promise<File> {
    if (!this.isLoaded) {
      await this.loadFFmpeg();
    }

    const inputName = 'input_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const outputName = 'transcoded_' + Date.now() + '.mp4';

    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    await this.ffmpeg.exec([
      '-i', inputName,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      outputName,
    ], this.getDefaultTimeout());

    const fileData = await this.ffmpeg.readFile(outputName);
    const blob = new Blob([fileData as ArrayBuffer], { type: 'video/mp4' });
    const outputFile = new File(
      [blob],
      file.name.replace(/\.[^.]+$/, '') + '.mp4',
      { type: 'video/mp4' }
    );

    try { await this.ffmpeg.deleteFile(inputName); } catch { /* already removed */ }
    try { await this.ffmpeg.deleteFile(outputName); } catch { /* already removed */ }

    return outputFile;
  }

  /** transcode a remote AVI url to mp4 — used for quick smoke-testing */
  async transcode(videoURL = 'https://raw.githubusercontent.com/ffmpegwasm/testdata/master/video-15s.avi'): Promise<Blob> {
    if (!this.isLoaded) {
      await this.loadFFmpeg();
    }

    await this.ffmpeg.writeFile('input.avi', await fetchFile(videoURL));
    await this.ffmpeg.exec(['-i', 'input.avi', 'output.mp4']);
    const fileData = await this.ffmpeg.readFile('output.mp4');
    const blob = new Blob([fileData as ArrayBuffer], { type: 'video/mp4' });

    try { await this.ffmpeg.deleteFile('input.avi'); } catch { /* already removed */ }
    try { await this.ffmpeg.deleteFile('output.mp4'); } catch { /* already removed */ }

    return blob;
  }
}
