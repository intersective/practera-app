import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgZone } from '@angular/core';

import { FfmpegService, CompressionResult } from './ffmpeg.service';

describe('FfmpegService', () => {
  let service: FfmpegService;
  let ngZone: NgZone;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FfmpegService);
    ngZone = TestBed.inject(NgZone);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should inject NgZone', () => {
    expect(ngZone).toBeTruthy();
  });

  describe('progress$ and log$', () => {
    it('should expose progress$ subject', () => {
      expect(service.progress$).toBeTruthy();
      expect(typeof service.progress$.subscribe).toBe('function');
    });

    it('should expose log$ subject', () => {
      expect(service.log$).toBeTruthy();
      expect(typeof service.log$.subscribe).toBe('function');
    });

    it('should emit progress values to subscribers', () => {
      const emitted: any[] = [];
      const sub = service.progress$.subscribe(p => emitted.push(p));

      service.progress$.next({ progress: 0.5, timeUs: 1000 });
      service.progress$.next({ progress: 1.0, timeUs: 2000 });

      expect(emitted.length).toBe(2);
      expect(emitted[0].progress).toBe(0.5);
      expect(emitted[1].progress).toBe(1.0);
      sub.unsubscribe();
    });

    it('should emit log messages to subscribers', () => {
      const logs: string[] = [];
      const sub = service.log$.subscribe(msg => logs.push(msg));

      service.log$.next('encoding started');
      service.log$.next('frame=100');

      expect(logs.length).toBe(2);
      expect(logs[0]).toBe('encoding started');
      sub.unsubscribe();
    });
  });

  describe('isSupported', () => {
    it('should return true when WebAssembly and BigInt64Array exist', () => {
      expect(service.isSupported()).toBeTrue();
    });
  });

  describe('isMobile', () => {
    it('should return a boolean', () => {
      expect(typeof service.isMobile()).toBe('boolean');
    });
  });

  describe('getDevicePresets', () => {
    it('should return desktop presets when not mobile', () => {
      spyOn(service, 'isMobile').and.returnValue(false);
      const presets = service.getDevicePresets();
      expect(presets.maxHeight).toBe(720);
      expect(presets.crf).toBe(28);
      expect(presets.preset).toBe('fast');
      expect(presets.audioBitrate).toBe('128k');
    });

    it('should return mobile presets when mobile', () => {
      spyOn(service, 'isMobile').and.returnValue(true);
      const presets = service.getDevicePresets();
      expect(presets.maxHeight).toBe(480);
      expect(presets.crf).toBe(30);
      expect(presets.preset).toBe('ultrafast');
      expect(presets.audioBitrate).toBe('96k');
    });
  });

  describe('shouldCompress', () => {
    it('should skip non-video files', () => {
      const file = new File(['data'], 'test.pdf', { type: 'application/pdf' });
      const result = service.shouldCompress(file);
      expect(result.compress).toBeFalse();
      expect(result.reason).toContain('not a video');
    });

    it('should skip files smaller than 5 MB', () => {
      const data = new ArrayBuffer(1024 * 1024); // 1 MB
      const file = new File([data], 'small.mp4', { type: 'video/mp4' });
      const result = service.shouldCompress(file);
      expect(result.compress).toBeFalse();
      expect(result.reason).toContain('too small');
    });

    it('should approve video files within size limits', () => {
      // create a 10 MB video file
      const data = new ArrayBuffer(10 * 1024 * 1024);
      const file = new File([data], 'video.mp4', { type: 'video/mp4' });
      spyOn(service, 'isMobile').and.returnValue(false);
      const result = service.shouldCompress(file);
      expect(result.compress).toBeTrue();
    });

    it('should reject files over mobile size limit', () => {
      spyOn(service, 'isMobile').and.returnValue(true);
      // mock the file size via Object.defineProperty
      const file = new File(['x'], 'big.mp4', { type: 'video/mp4' });
      Object.defineProperty(file, 'size', { value: 201 * 1024 * 1024 });
      const result = service.shouldCompress(file);
      expect(result.compress).toBeFalse();
      expect(result.reason).toContain('200');
    });

    it('should reject files over desktop size limit', () => {
      spyOn(service, 'isMobile').and.returnValue(false);
      const file = new File(['x'], 'huge.mp4', { type: 'video/mp4' });
      Object.defineProperty(file, 'size', { value: 501 * 1024 * 1024 });
      const result = service.shouldCompress(file);
      expect(result.compress).toBeFalse();
      expect(result.reason).toContain('500');
    });
  });

  describe('compressVideo', () => {
    it('should return skipped result for non-video file', async () => {
      const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' });
      const result = await service.compressVideo(file);
      expect(result.skipped).toBeTrue();
      expect(result.skipReason).toContain('not a video');
      expect(result.file).toBe(file);
    });

    it('should return skipped result for tiny video', async () => {
      const file = new File(['data'], 'tiny.mp4', { type: 'video/mp4' });
      const result = await service.compressVideo(file);
      expect(result.skipped).toBeTrue();
      expect(result.skipReason).toContain('too small');
    });
  });

  describe('isFfmpegLoaded', () => {
    it('should return false initially', () => {
      expect(service.isFfmpegLoaded()).toBeFalse();
    });
  });

  describe('transcodeToMp4', () => {
    it('should attempt to load ffmpeg if not loaded', async () => {
      const loadSpy = spyOn(service, 'loadFFmpeg').and.rejectWith(new Error('test: skip actual load'));
      const file = new File(['data'], 'video.avi', { type: 'video/x-msvideo' });

      try {
        await service.transcodeToMp4(file);
      } catch {
        // expected — we prevented actual load
      }

      expect(loadSpy).toHaveBeenCalled();
    });
  });

  describe('loadFFmpeg', () => {
    it('should skip loading if already loaded', async () => {
      // set isLoaded to true via reflection
      (service as any).isLoaded = true;
      const ffmpegSpy = spyOn((service as any).ffmpeg, 'load');

      await service.loadFFmpeg();

      expect(ffmpegSpy).not.toHaveBeenCalled();
      // reset
      (service as any).isLoaded = false;
    });
  });
});
