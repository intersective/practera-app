import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { BrowserStorageService } from '../../services/storage.service';
import { Subject } from 'rxjs';
import { UppyUploaderService } from '../uppy-uploader/uppy-uploader.service';

import { FileUploadComponent } from './file-upload.component';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let uppyUploaderService: jasmine.SpyObj<UppyUploaderService>;

  beforeEach(() => {
    uppyUploaderService = jasmine.createSpyObj<UppyUploaderService>('UppyUploaderService', [
      'createUppyInstance',
      'parseTusUploadResponse',
    ]);
    uppyUploaderService.parseTusUploadResponse.and.callFake((body) => JSON.parse(body));
    component = new FileUploadComponent(
      uppyUploaderService,
      new NgZone({ enableLongStackTrace: false }),
      jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']),
    );
    component.control = new FormControl('');
    component.submitActions$ = new Subject();
    component.question = {
      id: 11,
      name: 'Test Question',
      description: '',
      isRequired: false,
      fileType: 'any',
      audience: ['participant'],
      canAnswer: true,
      canComment: true,
    } as any;
    component.submissionId = 123;
    component.reviewId = 456;
    component.review = { answer: null, comment: 'old comment', file: {} };
    component.submission = { answer: null };
    component.uppy = jasmine.createSpyObj('Uppy', ['removeFile', 'clear', 'destroy']) as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return video note message for video fileType', () => {
    component.question.fileType = 'video';

    expect(component.noteMessage()).toContain('Videos only');
  });

  it('should return image note message for image fileType', () => {
    component.question.fileType = 'image';

    expect(component.noteMessage()).toContain('Images only');
  });

  it('should return default note message for any fileType', () => {
    component.question.fileType = 'any';

    expect(component.noteMessage()).toContain('Docs, images and videos only');
  });

  it('should parse tus response body in onAfterResponse', () => {
    const response = {
      getBody: () => JSON.stringify({ path: '/uploads/a', bucket: 'b', cdnUrl: 'c', directUrl: 'd' })
    };

    component.onAfterResponse({}, response);

    expect(uppyUploaderService.parseTusUploadResponse).toHaveBeenCalledWith(response.getBody());
    expect(component.tusResponse).toEqual({ path: '/uploads/a', bucket: 'b', cdnUrl: 'c', directUrl: 'd' });
  });

  it('should return empty object from fileRequestFormat when uploadedFile is empty', () => {
    component.uploadedFile = null as any;

    expect(component.fileRequestFormat()).toEqual({} as any);
  });

  it('should map uploadedFile in fileRequestFormat', () => {
    component.uploadedFile = {
      name: 'a.png',
      type: 'image/png',
      size: 10,
      extension: 'png',
      bucket: 'bucket',
      path: '/uploads/a',
      cdnUrl: 'https://cdn/a.png',
    } as any;

    expect(component.fileRequestFormat()).toEqual({
      name: 'a.png',
      type: 'image/png',
      size: 10,
      extension: 'png',
      bucket: 'bucket',
      path: '/uploads/a',
      url: 'https://cdn/a.png',
    });
  });

  it('should set review answer and trigger save in onChange with type', () => {
    component.doReview = true;
    component.uploadedFile = {
      name: 'a.pdf',
      type: 'application/pdf',
      size: 10,
      extension: 'pdf',
      bucket: 'bucket',
      path: '/uploads/a',
      cdnUrl: 'https://cdn/a.pdf',
    } as any;
    spyOn(component, 'triggerSave');

    component.onChange('new comment', 'comment');

    expect(component.innerValue.comment).toBe('new comment');
    expect(component.innerValue.file.url).toBe('https://cdn/a.pdf');
    expect(component.triggerSave).toHaveBeenCalled();
  });

  it('should set assessment value and trigger save in onChange without type', () => {
    component.doAssessment = true;
    component.uploadedFile = {
      name: 'a.pdf',
      type: 'application/pdf',
      size: 10,
      extension: 'pdf',
      bucket: 'bucket',
      path: '/uploads/a',
      cdnUrl: 'https://cdn/a.pdf',
    } as any;
    spyOn(component, 'triggerSave');

    component.onChange('');

    expect(component.innerValue.url).toBe('https://cdn/a.pdf');
    expect(component.triggerSave).toHaveBeenCalled();
  });

  it('should create and emit review save action in triggerSave', () => {
    component.doReview = true;
    component.innerValue = {
      file: { path: '/uploads/a' },
      comment: 'review comment'
    };
    const submitNextSpy = spyOn(component.submitActions$, 'next');

    component.triggerSave();

    expect(submitNextSpy).toHaveBeenCalled();
    expect((submitNextSpy.calls.mostRecent().args[0] as any).reviewSave).toEqual({
      reviewId: 456,
      submissionId: 123,
      questionId: 11,
      file: { path: '/uploads/a' },
      comment: 'review comment',
    });
  });

  it('should create and emit assessment save action in triggerSave', () => {
    component.doAssessment = true;
    component.innerValue = { path: '/uploads/a' };
    const submitNextSpy = spyOn(component.submitActions$, 'next');

    component.triggerSave();

    expect(submitNextSpy).toHaveBeenCalled();
    expect((submitNextSpy.calls.mostRecent().args[0] as any).questionSave).toEqual({
      submissionId: 123,
      questionId: 11,
      file: { path: '/uploads/a' },
    });
  });

  it('should add error when upload response status is not 200', () => {
    component.tusResponse = {
      bucket: 'bucket',
      path: '/uploads/a',
      cdnUrl: 'https://cdn/a',
      directUrl: 'https://direct/a',
    };
    component.doReview = true;
    spyOn(component, 'onChange');

    component.onFileUploadCompleted({
      name: 'a.pdf',
      type: 'application/pdf',
      size: 10,
      extension: 'pdf'
    } as any, {
      body: {} as XMLHttpRequest,
      status: 500,
      uploadURL: ''
    });

    expect(component.uploadedFile.name).toBe('a.pdf');
    expect(component.errors.length).toBe(1);
    expect(component.onChange).toHaveBeenCalledWith('', 'answer');
  });

  it('should remove submission answer and clear uppy in removeSubmitFile for assessment', () => {
    component.doAssessment = true;
    component.submission = { answer: { path: '/uploads/a' } };
    spyOn(component, 'onChange');

    component.removeSubmitFile({ handle: 'file-1' });

    expect(component.submission.answer).toBeNull();
    expect(component.onChange).toHaveBeenCalledWith('');
    expect((component.uppy.removeFile as any)).toHaveBeenCalledWith('file-1');
    expect((component.uppy.clear as any)).toHaveBeenCalled();
  });

  it('should remove review answer and clear uppy in removeSubmitFile for review', () => {
    component.doReview = true;
    component.review = { answer: { path: '/uploads/a' } } as any;
    spyOn(component, 'onChange');

    component.removeSubmitFile({ handle: 'file-2' });

    expect(component.review.answer).toBeNull();
    expect(component.onChange).toHaveBeenCalledWith('', 'answer');
    expect((component.uppy.removeFile as any)).toHaveBeenCalledWith('file-2');
    expect((component.uppy.clear as any)).toHaveBeenCalled();
  });

  it('should return true when audience contains reviewer and has more than one role', () => {
    component.question.audience = ['participant', 'reviewer'];

    expect(component.audienceContainReviewer()).toBeTrue();
  });

  it('should return false when reviewer is not in audience', () => {
    component.question.audience = ['participant'];

    expect(component.audienceContainReviewer()).toBeFalse();
  });

  it('should extract filename from upload URL', () => {
    const filename = component.extractFilenameFromUrl('https://file.practera.com/uploads/test-file+abc123');

    expect(filename).toBe('test-file');
  });

  it('should return null when filename pattern does not match', () => {
    const filename = component.extractFilenameFromUrl('https://example.com/other-path/test-file');

    expect(filename).toBeNull();
  });

  it('should call uppy.removeFile in sendDeleteRequestForFile', () => {
    component.sendDeleteRequestForFile({ id: 'id-1' });

    expect((component.uppy.removeFile as any)).toHaveBeenCalledWith('id-1');
  });

  it('should destroy uppy in ngOnDestroy', () => {
    component.ngOnDestroy();

    expect((component.uppy.destroy as any)).toHaveBeenCalled();
  });

  describe('onChange() - markAsDirty behavior', () => {
    it('should mark control as dirty in review mode (with type)', () => {
      component.doReview = true;
      component.uploadedFile = {
        name: 'test.pdf',
        type: 'application/pdf',
        size: 100,
        extension: 'pdf',
        bucket: 'bucket',
        path: '/uploads/test',
        cdnUrl: 'https://cdn/test.pdf',
      } as any;
      spyOn(component, 'triggerSave');

      component.onChange('review comment', 'comment');

      expect(component.control.dirty).toBeTrue();
      expect(component.control.touched).toBeTrue();
    });

    it('should mark control as dirty in assessment mode (without type)', () => {
      component.doAssessment = true;
      component.uploadedFile = {
        name: 'test.pdf',
        type: 'application/pdf',
        size: 100,
        extension: 'pdf',
        bucket: 'bucket',
        path: '/uploads/test',
        cdnUrl: 'https://cdn/test.pdf',
      } as any;
      spyOn(component, 'triggerSave');

      component.onChange('');

      expect(component.control.dirty).toBeTrue();
      expect(component.control.touched).toBeTrue();
    });

    it('should set innerValue with file and type property in review mode', () => {
      component.doReview = true;
      component.uploadedFile = {
        name: 'doc.pdf',
        type: 'application/pdf',
        size: 50,
        extension: 'pdf',
        bucket: 'b',
        path: '/uploads/doc',
        cdnUrl: 'https://cdn/doc.pdf',
      } as any;
      spyOn(component, 'triggerSave');

      component.onChange('new answer', 'answer');

      expect(component.innerValue.answer).toBe('new answer');
      expect(component.innerValue.file).toBeDefined();
      expect(component.innerValue.file.url).toBe('https://cdn/doc.pdf');
    });

    it('should initialize innerValue if not set in review mode', () => {
      component.doReview = true;
      component.innerValue = null;
      component.uploadedFile = {
        name: 'a.pdf',
        type: 'application/pdf',
        size: 10,
        extension: 'pdf',
        bucket: 'b',
        path: '/uploads/a',
        cdnUrl: 'https://cdn/a.pdf',
      } as any;
      spyOn(component, 'triggerSave');

      component.onChange('comment text', 'comment');

      expect(component.innerValue.comment).toBe('comment text');
      expect(component.innerValue.file).toBeDefined();
    });
  });

  describe('_showSavedAnswers() - pristine check and uploadedFile restoration', () => {
    describe('review mode', () => {
      beforeEach(() => {
        component.reviewStatus = 'in progress';
        component.doReview = true;
        component.review = {
          answer: { url: 'https://cdn/saved.pdf', name: 'saved.pdf' },
          comment: 'saved comment',
          file: { url: 'https://cdn/saved.pdf', name: 'saved.pdf', path: '/uploads/saved' },
        };
      });

      it('should use saved review data when control is pristine', () => {
        component.control = new FormControl('');

        component['_showSavedAnswers']();

        expect(component.innerValue).toEqual({
          answer: component.review.answer,
          comment: component.review.comment,
          file: component.review.file,
        });
        expect(component.comment).toBe('saved comment');
      });

      it('should preserve control value when control is dirty', () => {
        const dirtyValue = {
          answer: 'user edited',
          comment: 'user comment',
          file: { url: 'https://cdn/edited.pdf', name: 'edited.pdf', path: '/uploads/edited' },
        };
        component.control = new FormControl(dirtyValue);
        component.control.markAsDirty();

        component['_showSavedAnswers']();

        expect(component.innerValue).toEqual(dirtyValue);
        expect(component.comment).toBe('user comment');
      });

      it('should restore uploadedFile from file.url when control is dirty with file data', () => {
        const dirtyValue = {
          answer: 'edited',
          comment: 'edited comment',
          file: { url: 'https://cdn/dirty-file.pdf', name: 'dirty-file.pdf', path: '/uploads/dirty' },
        };
        component.control = new FormControl(dirtyValue);
        component.control.markAsDirty();

        component['_showSavedAnswers']();

        expect(component.uploadedFile).toBeDefined();
        expect(component.uploadedFile.cdnUrl).toBe('https://cdn/dirty-file.pdf');
      });

      it('should not set uploadedFile when dirty control has no file url', () => {
        const dirtyValue = {
          answer: 'edited',
          comment: 'edited comment',
          file: null,
        };
        component.control = new FormControl(dirtyValue);
        component.control.markAsDirty();
        component.uploadedFile = null as any;

        component['_showSavedAnswers']();

        // uploadedFile should remain null since file has no url
        expect(component.uploadedFile).toBeNull();
      });

      it('should fallback to review comment when dirty control has no comment', () => {
        const dirtyValue = { answer: 'edited', file: null };
        component.control = new FormControl(dirtyValue);
        component.control.markAsDirty();

        component['_showSavedAnswers']();

        expect(component.comment).toBe('saved comment');
      });
    });

    describe('assessment mode', () => {
      beforeEach(() => {
        component.submissionStatus = 'in progress';
        component.doAssessment = true;
        component.submission = {
          answer: { url: 'https://cdn/submission.pdf', name: 'submission.pdf', path: '/uploads/sub' },
        };
        component.reviewStatus = '';
        component.doReview = false;
      });

      it('should use saved submission answer when control is pristine', () => {
        component.control = new FormControl('');

        component['_showSavedAnswers']();

        expect(component.innerValue).toEqual(component.submission.answer);
      });

      it('should preserve control value when control is dirty', () => {
        const dirtyValue = { url: 'https://cdn/user-edit.pdf', name: 'user-edit.pdf', path: '/uploads/user' };
        component.control = new FormControl(dirtyValue);
        component.control.markAsDirty();

        component['_showSavedAnswers']();

        expect(component.innerValue).toEqual(dirtyValue);
      });

      it('should restore uploadedFile from innerValue.url when control is dirty', () => {
        const dirtyValue = { url: 'https://cdn/dirty.pdf', name: 'dirty.pdf', path: '/uploads/dirty' };
        component.control = new FormControl(dirtyValue);
        component.control.markAsDirty();

        component['_showSavedAnswers']();

        expect(component.uploadedFile).toBeDefined();
        expect(component.uploadedFile.cdnUrl).toBe('https://cdn/dirty.pdf');
      });

      it('should not restore uploadedFile when dirty control has no url', () => {
        component.control = new FormControl({});
        component.control.markAsDirty();
        component.uploadedFile = null as any;

        component['_showSavedAnswers']();

        expect(component.uploadedFile).toBeNull();
      });
    });

    it('should set control value at the end', () => {
      component.submissionStatus = 'in progress';
      component.doAssessment = true;
      component.submission = { answer: { url: 'https://cdn/test.pdf' } };
      component.control = new FormControl('');

      component['_showSavedAnswers']();

      expect(component.control.value).toEqual(component.submission.answer);
    });

    describe('review mode with "not start" status', () => {
      it('should load review data when reviewStatus is "not start"', () => {
        component.reviewStatus = 'not start';
        component.doReview = true;
        component.review = {
          answer: { url: 'https://cdn/r.pdf' },
          comment: 'review comment',
          file: { url: 'https://cdn/r.pdf', name: 'r.pdf' },
        };
        component.control = new FormControl('');

        component['_showSavedAnswers']();

        expect(component.innerValue).toEqual({
          answer: component.review.answer,
          comment: component.review.comment,
          file: component.review.file,
        });
      });
    });
  });

  describe('isDisplayOnly behavior via ngOnInit paths', () => {
    it('should restore saved file from submission answer URL when control is dirty in assessment mode', () => {
      component.submissionStatus = 'in progress';
      component.doAssessment = true;
      const savedFile = { url: 'https://cdn/sub-file.pdf', name: 'sub-file.pdf', path: '/uploads/sub' };
      component.submission = { answer: savedFile };
      component.control = new FormControl(savedFile);
      component.control.markAsDirty();

      component['_showSavedAnswers']();

      expect(component.uploadedFile).toBeDefined();
      expect(component.uploadedFile.cdnUrl).toBe('https://cdn/sub-file.pdf');
    });

    it('should restore saved file from review file URL when control is dirty in review mode', () => {
      component.reviewStatus = 'in progress';
      component.doReview = true;
      const savedReview = {
        answer: null,
        comment: 'test',
        file: { url: 'https://cdn/rev-file.pdf', name: 'rev-file.pdf', path: '/uploads/rev' },
      };
      component.review = savedReview;
      component.control = new FormControl(savedReview);
      component.control.markAsDirty();

      component['_showSavedAnswers']();

      expect(component.uploadedFile).toBeDefined();
      expect(component.uploadedFile.cdnUrl).toBe('https://cdn/rev-file.pdf');
    });
  });
});

describe('FileUploadComponent dashboard rendering', () => {
  let fixtures: ComponentFixture<FileUploadComponent>[];

  beforeEach(async () => {
    fixtures = [];
    const storage = {
      getUser: () => ({ apikey: 'test-only' }),
      clearByName: () => undefined,
    } as unknown as BrowserStorageService;
    const uploader = new UppyUploaderService(null!, storage);

    TestBed.configureTestingModule({
      declarations: [FileUploadComponent],
      imports: [CommonModule, FormsModule, IonicModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    TestBed.overrideProvider(UppyUploaderService, { useValue: uploader });
    await TestBed.compileComponents();
  });

  afterEach(() => {
    fixtures.forEach(fixture => fixture.destroy());
  });

  async function render(
    mode: 'assessment' | 'review',
    fileType: 'any' | 'image' | 'video' = 'any',
    answer: any = null,
  ): Promise<ComponentFixture<FileUploadComponent>> {
    const fixture = TestBed.createComponent(FileUploadComponent);
    fixtures.push(fixture);
    const component = fixture.componentInstance;
    component.source = 'assessment';
    component.control = new FormControl('');
    component.submitActions$ = new Subject();
    component.question = {
      id: 11,
      name: 'Upload evidence',
      description: '',
      isRequired: false,
      fileType,
      audience: ['participant', 'reviewer'],
      canAnswer: true,
      canComment: true,
    };
    component.submissionId = 123;
    component.reviewId = 456;
    component.doAssessment = mode === 'assessment';
    component.doReview = mode === 'review';
    component.submissionStatus = 'in progress';
    component.reviewStatus = 'in progress';
    component.submission = { answer: mode === 'assessment' ? answer : null };
    component.review = { answer: mode === 'review' ? answer : null, comment: '', file: {} };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  for (const mode of ['assessment', 'review'] as const) {
    it(`renders a usable file picker for a new ${mode} answer`, async () => {
      const fixture = await render(mode);
      const picker = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;

      expect(fixture.nativeElement.querySelector('.uppy-Dashboard-browse')).not.toBeNull();
      expect(picker).not.toBeNull();
    });

    it(`hides the file picker when the SDK completes a ${mode} upload`, async () => {
      const fixture = await render(mode);
      const component = fixture.componentInstance;
      component.onAfterResponse({}, { getBody: () => JSON.stringify({
        bucket: 'evidence', path: '/evidence.pdf',
        cdnUrl: 'https://cdn.example.test/evidence.pdf', directUrl: 'https://files.example.test/evidence.pdf',
      }) });
      const fileId = component.uppy.addFile({ name: 'evidence.pdf', type: 'application/pdf',
        data: new Blob(['evidence'], { type: 'application/pdf' }) });

      component.uppy.emit('upload-success', component.uppy.getFile(fileId), {
        body: {}, status: 200, uploadURL: 'https://upload.example.test/evidence.pdf',
      });
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('input[type="file"]')).toBeNull();
      expect(component.uppy.getPlugin('Dashboard')).toBeUndefined();
      expect(fixture.nativeElement.querySelector('.uppy-Dashboard')).toBeNull();
      expect(component.control.value).toEqual(mode === 'assessment' ? {
        name: 'evidence.pdf', type: 'application/pdf', size: 8, extension: 'pdf',
        bucket: 'evidence', path: '/evidence.pdf', url: 'https://cdn.example.test/evidence.pdf',
      } : {
        answer: '', comment: '', file: {
          name: 'evidence.pdf', type: 'application/pdf', size: 8, extension: 'pdf',
          bucket: 'evidence', path: '/evidence.pdf', url: 'https://cdn.example.test/evidence.pdf',
        },
      });
    });

    it(`hides the file picker for a saved ${mode} answer`, async () => {
      const fixture = await render(mode, 'any', { name: 'saved.pdf', url: 'https://cdn.example.test/saved.pdf' });

      expect(fixture.nativeElement.querySelector('input[type="file"]')).toBeNull();
      expect(fixture.componentInstance.uppy.getPlugin('Dashboard')).toBeUndefined();
    });

    it(`mounts the file picker after removing a saved ${mode} answer`, async () => {
      const fixture = await render(mode, 'any', { name: 'saved.pdf', url: 'https://cdn.example.test/saved.pdf' });

      fixture.componentInstance.removeSubmitFile();
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.uppy-Dashboard-browse')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('input[type="file"]')).not.toBeNull();
    });

    it(`remounts the file picker after removing an uploaded ${mode} answer`, async () => {
      const fixture = await render(mode);
      const component = fixture.componentInstance;
      component.uploadedFile = { name: 'new.pdf', type: 'application/pdf', size: 1, extension: 'pdf',
        bucket: 'evidence', path: '/new.pdf', cdnUrl: 'https://cdn.example.test/new.pdf' } as any;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('input[type="file"]')).toBeNull();
      expect(component.uppy.getPlugin('Dashboard')).toBeUndefined();

      component.removeSubmitFile();
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelectorAll('.uppy-Dashboard')).toHaveSize(1);
      expect(fixture.nativeElement.querySelector('input[type="file"]')).not.toBeNull();
    });
  }

  it('releases selected files and dashboard DOM when the component is destroyed', async () => {
    const fixture = await render('assessment');
    const uppy = fixture.componentInstance.uppy;
    const host = fixture.nativeElement as HTMLElement;
    const dashboard = host.querySelector('.uppy-Dashboard');
    uppy.addFile({ name: 'evidence.pdf', type: 'application/pdf', data: new Blob(['evidence'], { type: 'application/pdf' }) });
    expect(uppy.getFiles()).toHaveSize(1);
    expect(dashboard).not.toBeNull();

    fixture.destroy();

    expect(uppy.getFiles()).toHaveSize(0);
    expect(uppy.getPlugin('Dashboard')).toBeUndefined();
    expect(host.querySelector('.uppy-Dashboard')).toBeNull();
  });

  it('keeps the upload notice specific to each mounted question', async () => {
    const image = await render('assessment', 'image');
    const video = await render('review', 'video');
    image.componentInstance.uploadedFile = { name: 'saved.png' } as any;
    image.changeDetectorRef.markForCheck();
    image.detectChanges();
    image.componentInstance.removeSubmitFile();
    image.changeDetectorRef.markForCheck();
    image.detectChanges();
    await image.whenStable();

    expect(image.nativeElement.querySelector('.uppy-Dashboard-note')?.textContent).toContain('Images only');
    expect(video.nativeElement.querySelector('.uppy-Dashboard-note')?.textContent).toContain('Videos only');
  });

  for (const restriction of [
    { fileType: 'image' as const, accepted: 'image/png', name: 'evidence.png', rejected: 'video/mp4', accept: 'image/*' },
    { fileType: 'video' as const, accepted: 'video/mp4', name: 'evidence.mp4', rejected: 'image/png', accept: 'video/*' },
  ]) {
    it(`enforces ${restriction.fileType} question restrictions at the file picker boundary`, async () => {
      const fixture = await render('assessment', restriction.fileType);
      const uppy = fixture.componentInstance.uppy;
      const picker = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;

      expect(picker?.accept).toBe(restriction.accept);
      const bytes = restriction.fileType === 'image'
        ? Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aKxkAAAAASUVORK5CYII='), character => character.charCodeAt(0))
        : new TextEncoder().encode('allowed');
      uppy.addFile({ name: restriction.name, type: restriction.accepted,
        data: new Blob([bytes], { type: restriction.accepted }) });
      expect(uppy.getFiles()).toHaveSize(1);
      expect(() => uppy.addFile({ name: 'wrong-type', type: restriction.rejected,
        data: new Blob(['rejected'], { type: restriction.rejected }) })).toThrow();
      expect(uppy.getFiles()).toHaveSize(1);
    });
  }

  it('allows documents for an unrestricted question', async () => {
    const fixture = await render('review');
    const uppy = fixture.componentInstance.uppy;

    uppy.addFile({ name: 'evidence.pdf', type: 'application/pdf', data: new Blob(['evidence'], { type: 'application/pdf' }) });

    expect(uppy.getFiles()).toHaveSize(1);
  });
});
