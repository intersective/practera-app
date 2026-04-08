import { TestBed } from '@angular/core/testing';

import { FfmpegService, CompressionResult } from './ffmpeg.service';

describe('FfmpegService', () => {
  let service: FfmpegService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FfmpegService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
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
});
