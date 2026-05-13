import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subject } from 'rxjs';
import { Uppy } from '@uppy/core';

import { FileUploadComponent } from './file-upload.component';
import { UppyUploaderService } from '../uppy-uploader/uppy-uploader.service';
import { CompressionProgress } from '../../services/ffmpeg.service';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;
  let uppyServiceSpy: jasmine.SpyObj<UppyUploaderService>;
  let cdrSpy: jasmine.Spy;
  let compressionProgress$: Subject<{ uppy: Uppy<any, any>; progress: CompressionProgress | null }>;
  let mockUppy: any;

  beforeEach(async () => {
    compressionProgress$ = new Subject();
    mockUppy = {
      on: jasmine.createSpy('on').and.returnValue({ on: jasmine.createSpy('chainOn').and.callFake(function() { return this; }) }),
      use: jasmine.createSpy('use').and.returnValue(mockUppy),
      destroy: jasmine.createSpy('destroy'),
      removeFile: jasmine.createSpy('removeFile'),
      clear: jasmine.createSpy('clear'),
      resetProgress: jasmine.createSpy('resetProgress'),
      addPreProcessor: jasmine.createSpy('addPreProcessor'),
      getFile: jasmine.createSpy('getFile'),
    };

    // make .on() chainable properly
    mockUppy.on.and.returnValue(mockUppy);

    uppyServiceSpy = jasmine.createSpyObj('UppyUploaderService', ['createUppyInstance', 'cancelCompression'], {
      compressionProgress$,
      uppyProps: {
        inline: true,
        width: '100%',
        height: '200px',
        singleFileFullScreen: true,
        note: 'Upload files here',
        proudlyDisplayPoweredByUppy: false,
        hideRetryButton: false,
        hidePauseResumeButton: false,
        hideCancelButton: false,
        showRemoveButtonAfterComplete: true,
        hideProgressAfterFinish: false,
      },
    });
    uppyServiceSpy.createUppyInstance.and.returnValue(mockUppy);

    await TestBed.configureTestingModule({
      declarations: [FileUploadComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: UppyUploaderService, useValue: uppyServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    component.source = 'assessment';
    component.submitActions$ = new Subject();
    cdrSpy = spyOn(component['cdr'], 'markForCheck');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should have isCompressing false initially', () => {
    expect(component.isCompressing).toBeFalse();
  });

  it('should have compressionProgress 0 initially', () => {
    expect(component.compressionProgress).toBe(0);
  });

  describe('compression progress subscription', () => {
    beforeEach(() => {
      fixture.detectChanges(); // triggers ngOnInit
    });

    it('should set isCompressing to true when progress is emitted for own uppy', () => {
      compressionProgress$.next({ uppy: mockUppy, progress: { progress: 0.5, timeUs: 1000 } });
      expect(component.isCompressing).toBeTrue();
    });

    it('should update compressionProgress percentage', () => {
      compressionProgress$.next({ uppy: mockUppy, progress: { progress: 0.75, timeUs: 2000 } });
      expect(component.compressionProgress).toBe(75);
    });

    it('should call markForCheck when progress updates', () => {
      compressionProgress$.next({ uppy: mockUppy, progress: { progress: 0.3, timeUs: 500 } });
      expect(cdrSpy).toHaveBeenCalled();
    });

    it('should set isCompressing to false when progress is null (done)', () => {
      compressionProgress$.next({ uppy: mockUppy, progress: { progress: 1.0, timeUs: 3000 } });
      expect(component.isCompressing).toBeTrue();

      compressionProgress$.next({ uppy: mockUppy, progress: null });
      expect(component.isCompressing).toBeFalse();
      expect(component.compressionProgress).toBe(0);
    });

    it('should ignore progress from a different uppy instance', () => {
      const otherUppy = {} as Uppy<any, any>;
      compressionProgress$.next({ uppy: otherUppy, progress: { progress: 0.9, timeUs: 5000 } });
      expect(component.isCompressing).toBeFalse();
      expect(component.compressionProgress).toBe(0);
    });

    it('should not call markForCheck for a different uppy instance', () => {
      const otherUppy = {} as Uppy<any, any>;
      compressionProgress$.next({ uppy: otherUppy, progress: { progress: 0.5, timeUs: 1000 } });
      expect(cdrSpy).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from compression progress', () => {
      fixture.detectChanges();
      const sub = component['compressionSub'];
      expect(sub).toBeTruthy();

      spyOn(sub, 'unsubscribe');
      component.ngOnDestroy();
      expect(sub.unsubscribe).toHaveBeenCalled();
    });

    it('should destroy the uppy instance', () => {
      fixture.detectChanges();
      component.ngOnDestroy();
      expect(mockUppy.destroy).toHaveBeenCalled();
    });
  });

  describe('noteMessage', () => {
    it('should return video-specific message for video fileType', () => {
      component.question = { ...component.question, fileType: 'video' };
      expect(component.noteMessage()).toContain('Videos only');
    });

    it('should return image-specific message for image fileType', () => {
      component.question = { ...component.question, fileType: 'image' };
      expect(component.noteMessage()).toContain('Images only');
    });

    it('should return generic message for any fileType', () => {
      component.question = { ...component.question, fileType: 'any' };
      expect(component.noteMessage()).toContain('Docs, images and videos');
    });
  });
});
