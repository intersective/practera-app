import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { UppyUploaderService } from '../uppy-uploader/uppy-uploader.service';

import { FileUploadComponent } from './file-upload.component';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let uppyUploaderService: jasmine.SpyObj<UppyUploaderService>;

  beforeEach(() => {
    uppyUploaderService = jasmine.createSpyObj<UppyUploaderService>('UppyUploaderService', ['createUppyInstance']);
    component = new FileUploadComponent(uppyUploaderService);
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
});
