import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subject } from 'rxjs';
import { Uppy } from '@uppy/core';

import { FileUploadComponent } from './file-upload.component';
import { UppyUploaderService } from '../uppy-uploader/uppy-uploader.service';
import { CompressionProgress } from '../../services/ffmpeg.service';
import { FormControl } from '@angular/forms';

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
    component.uppy = mockUppy;
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
      expect(uppyServiceSpy.cancelCompression).toHaveBeenCalled();
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

  describe('Uppy configuration and events', () => {
    it('should restrict video questions to video files', () => {
      component.question = { ...component.question, fileType: 'video' };

      component.ngOnInit();

      expect(uppyServiceSpy.createUppyInstance.calls.mostRecent().args[3]).toEqual({
        allowedFileTypes: ['video/*'],
      });
    });

    it('should restrict image questions to image files', () => {
      component.question = { ...component.question, fileType: 'image' };

      component.ngOnInit();

      expect(uppyServiceSpy.createUppyInstance.calls.mostRecent().args[3]).toEqual({
        allowedFileTypes: ['image/*'],
      });
    });

    it('should parse the TUS response body', () => {
      spyOn(console, 'log');
      const body = { bucket: 'files', path: '/file.pdf', cdnUrl: 'cdn/file.pdf', directUrl: 'direct/file.pdf' };

      component.onAfterResponse({}, { getBody: () => JSON.stringify(body) });

      expect(component.tusResponse).toEqual(body);
    });

    it('should register file handlers and remove deleted files', () => {
      spyOn(console, 'log');
      component.uppy = mockUppy;
      component.initializeEventHandlers(mockUppy);
      const filesAdded = mockUppy.on.calls.argsFor(0)[1];
      const fileRemoved = mockUppy.on.calls.argsFor(1)[1];

      filesAdded([{ id: 'added' }]);
      fileRemoved({ id: 'removed' });

      expect(mockUppy.on).toHaveBeenCalledWith('files-added', jasmine.any(Function));
      expect(mockUppy.on).toHaveBeenCalledWith('file-removed', jasmine.any(Function));
      expect(mockUppy.removeFile).toHaveBeenCalledWith('removed');
    });
  });

  describe('upload completion and form propagation', () => {
    const uploadedData = {
      id: 'file-1',
      name: 'evidence.pdf',
      type: 'application/pdf',
      size: 1024,
      extension: 'pdf',
    } as any;

    beforeEach(() => {
      component.tusResponse = {
        bucket: 'assessment',
        path: '/evidence.pdf',
        cdnUrl: 'https://cdn/evidence.pdf',
        directUrl: 'https://direct/evidence.pdf',
      };
    });

    it('should map a successful assessment upload and trigger answer change', () => {
      component.doReview = false;
      const changeSpy = spyOn(component, 'onChange');

      component.onFileUploadCompleted(uploadedData, { status: 200 } as any);

      expect(component.uploadedFile.url).toBe('https://cdn/evidence.pdf');
      expect(changeSpy).toHaveBeenCalledWith('', undefined);
      expect(component.errors).toEqual([]);
    });

    it('should trigger review answer change and expose non-200 failures', () => {
      component.doReview = true;
      const changeSpy = spyOn(component, 'onChange');

      component.onFileUploadCompleted(uploadedData, { status: 500 } as any);

      expect(changeSpy).toHaveBeenCalledWith('', 'answer');
      expect(component.errors).toEqual(['File upload failed, please try again later.']);
    });

    it('should emit an assessment save and update its form control', () => {
      component.doAssessment = true;
      component.doReview = false;
      component.submissionId = 10;
      component.question = { ...component.question, id: 20 };
      component.innerValue = { url: 'https://cdn/evidence.pdf' };
      component.control = new FormControl();
      const actions: any[] = [];
      component.submitActions$.subscribe(action => actions.push(action));

      component.triggerSave();

      expect(component.control.value).toEqual(component.innerValue);
      expect(actions[0].questionSave).toEqual({
        submissionId: 10,
        questionId: 20,
        file: component.innerValue,
      });
    });

    it('should emit a review save with comment and file', () => {
      component.doAssessment = false;
      component.doReview = true;
      component.reviewId = 30;
      component.submissionId = 10;
      component.question = { ...component.question, id: 20 };
      component.innerValue = { comment: 'Looks good', file: { url: 'https://cdn/evidence.pdf' } };
      const actions: any[] = [];
      component.submitActions$.subscribe(action => actions.push(action));

      component.triggerSave();

      expect(actions[0].reviewSave).toEqual({
        reviewId: 30,
        submissionId: 10,
        questionId: 20,
        file: component.innerValue.file,
        comment: 'Looks good',
      });
    });

    it('should initialise review state and mark the control as edited', () => {
      component.doReview = true;
      component.control = new FormControl();
      component.uploadedFile = {
        name: 'evidence.pdf', type: 'application/pdf', size: 1, extension: 'pdf',
        bucket: 'assessment', path: '/evidence.pdf', url: 'unused',
        cdnUrl: 'https://cdn/evidence.pdf', directUrl: 'https://direct/evidence.pdf',
      };
      spyOn(component, 'triggerSave');

      component.onChange('review comment', 'comment');

      expect(component.innerValue.comment).toBe('review comment');
      expect(component.innerValue.file.url).toBe('https://cdn/evidence.pdf');
      expect(component.control.dirty).toBeTrue();
      expect(component.control.touched).toBeTrue();
      expect(component.triggerSave).toHaveBeenCalled();
    });

    it('should return empty and populated API file formats', () => {
      expect(component.fileRequestFormat()).toEqual({} as any);

      component.uploadedFile = {
        name: 'evidence.pdf', type: 'application/pdf', size: 1, extension: 'pdf',
        bucket: 'assessment', path: '/evidence.pdf', url: 'unused',
        cdnUrl: 'https://cdn/evidence.pdf', directUrl: 'https://direct/evidence.pdf',
      };

      expect(component.fileRequestFormat()).toEqual({
        name: 'evidence.pdf', type: 'application/pdf', size: 1, extension: 'pdf',
        bucket: 'assessment', path: '/evidence.pdf', url: 'https://cdn/evidence.pdf',
      });
    });
  });

  describe('saved answers and removal', () => {
    it('should restore an edited review file from the control', () => {
      component.doReview = true;
      component.reviewStatus = 'in progress';
      component.review = { answer: '', comment: 'saved', file: null };
      component.control = new FormControl({
        answer: '', comment: 'edited', file: { url: 'https://cdn/edited.pdf' },
      });
      component.control.markAsDirty();

      component['_showSavedAnswers']();

      expect(component.comment).toBe('edited');
      expect(component.uploadedFile.cdnUrl).toBe('https://cdn/edited.pdf');
    });

    it('should restore pristine review data', () => {
      component.doReview = true;
      component.reviewStatus = 'not start';
      component.review = { answer: 'review', comment: 'saved', file: { url: 'saved.pdf' } };
      component.control = new FormControl();

      component['_showSavedAnswers']();

      expect(component.innerValue).toEqual(component.review);
      expect(component.comment).toBe('saved');
    });

    it('should restore an edited assessment file from the control', () => {
      component.doAssessment = true;
      component.submissionStatus = 'in progress';
      component.submission = { answer: { url: 'saved.pdf' } };
      component.control = new FormControl({ url: 'https://cdn/edited.pdf' });
      component.control.markAsDirty();

      component['_showSavedAnswers']();

      expect(component.innerValue.url).toBe('https://cdn/edited.pdf');
      expect(component.uploadedFile.cdnUrl).toBe('https://cdn/edited.pdf');
    });

    it('should clear assessment files from state and Uppy', () => {
      component.doAssessment = true;
      component.submission = { answer: { url: 'saved.pdf' } };
      component.uppy = mockUppy;
      spyOn(component, 'onChange');

      component.removeSubmitFile({ handle: 'file-1' });

      expect(component.submission.answer).toBeNull();
      expect(component.onChange).toHaveBeenCalledWith('');
      expect(mockUppy.removeFile).toHaveBeenCalledWith('file-1');
      expect(mockUppy.clear).toHaveBeenCalled();
    });

    it('should clear review files and identify display helpers', () => {
      component.doReview = true;
      component.review = { answer: { url: 'saved.pdf' } };
      component.uppy = mockUppy;
      component.question = { ...component.question, audience: ['submitter', 'reviewer'] };
      spyOn(component, 'onChange');

      component.removeSubmitFile();

      expect(component.review.answer).toBeNull();
      expect(component.onChange).toHaveBeenCalledWith('', 'answer');
      expect(component.audienceContainReviewer()).toBeTrue();
      expect(component.extractFilenameFromUrl('/uploads/report.pdf+token')).toBe('report.pdf');
      expect(component.extractFilenameFromUrl('/other/report.pdf')).toBeNull();
    });
  });
});
