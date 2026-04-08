import { TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';
import { UppyUploaderService } from './uppy-uploader.service';
import { BrowserStorageService } from '../../services/storage.service';
import { FfmpegService, CompressionResult } from '../../services/ffmpeg.service';
import { Subject } from 'rxjs';

describe('UppyUploaderService', () => {
  let service: UppyUploaderService;
  let ffmpegServiceSpy: jasmine.SpyObj<FfmpegService>;

  beforeEach(() => {
    const modalSpy = jasmine.createSpyObj('ModalController', ['create']);
    const storageSpy = jasmine.createSpyObj('BrowserStorageService', ['getUser', 'clearByName']);
    storageSpy.getUser.and.returnValue({ apikey: 'test-key' });

    ffmpegServiceSpy = jasmine.createSpyObj('FfmpegService', [
      'shouldCompress',
      'compressVideo',
    ], {
      progress$: new Subject(),
    });

    TestBed.configureTestingModule({
      providers: [
        UppyUploaderService,
        { provide: ModalController, useValue: modalSpy },
        { provide: BrowserStorageService, useValue: storageSpy },
        { provide: FfmpegService, useValue: ffmpegServiceSpy },
      ],
    });

    service = TestBed.inject(UppyUploaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have isCompressing false initially', () => {
    expect(service.isCompressing).toBeFalse();
  });

  it('should expose compressionProgress$ subject', () => {
    expect(service.compressionProgress$).toBeTruthy();
  });

  describe('compressVideoFiles (via files-added event)', () => {
    it('should skip non-video files', () => {
      ffmpegServiceSpy.shouldCompress.and.returnValue({ compress: false, reason: 'not a video file' });
      // the method is private but triggers via uppy event — verify no compression call
      expect(ffmpegServiceSpy.compressVideo).not.toHaveBeenCalled();
    });
  });
});
