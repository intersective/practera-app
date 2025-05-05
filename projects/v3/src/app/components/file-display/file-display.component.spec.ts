/* eslint-disable no-console */
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange, DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, flushMicrotasks, waitForAsync, tick } from '@angular/core/testing';
import { FileDisplayComponent } from './file-display.component';
import { FilestackService } from '@v3/services/filestack.service';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { UtilsService } from '@v3/services/utils.service';
import { TestUtils } from '@testingv3/utils';
import { environment } from '@v3/environments/environment';
import { FileInput, TusFileResponse } from '../types/assessment';

class OnChangedValues extends SimpleChange {
  constructor(older, latest) {
    super(older, latest, false);
  }
}

describe('FileDisplayComponent', () => {
  let component: FileDisplayComponent;
  let fixture: ComponentFixture<FileDisplayComponent>;
  let filestackSpy: jasmine.SpyObj<FilestackService>;
  let utilsSpy: jasmine.SpyObj<UtilsService>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule],
      declarations: [FileDisplayComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: FilestackService,
          useValue: jasmine.createSpyObj('FilestackService', [
            'previewFile',
            'getWorkflowStatus',
            'metadata'
          ])
        },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileDisplayComponent);
    component = fixture.debugElement.componentInstance;
    filestackSpy = TestBed.inject(FilestackService) as jasmine.SpyObj<FilestackService>;
    utilsSpy = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should preview file', () => {
    component.previewFile({
      bucket: 'test-bucket',
      path: 'test-path',
      name: 'test-file',
      url: 'DUMMY_URL',
      extension: 'jpg',
      type: 'image/jpeg',
      size: 1000
    });
    expect(filestackSpy.previewFile.calls.count()).toBe(1);
  });

  it('should fail, if preview file api is faulty', fakeAsync(() => {
    const error = 'PREVIEW FILE SAMPLE ERROR';
    // filestackSpy.metadata.and.rejectWith(error);
    filestackSpy.previewFile.and.rejectWith(error);
    component.previewFile({
      bucket: 'test-bucket',
      path: 'test-path',
      name: 'test-file',
      url: 'file',
      extension: 'jpg',
      type: 'image/jpeg',
      size: 1000
    }).then(res => {
      console.info('afterPreview', res);
    });
    flushMicrotasks();
  }));

  describe('UI logic', () => {
    const url = 'test.com/uilogic';
    beforeEach(() => {
      component.file = {
        bucket: 'test-bucket',
        path: 'test-path',
        name: 'test-file',
        url: url,
        extension: 'jpg',
        type: 'image/jpeg',
        size: 1000
      } as TusFileResponse;
    });
    it('should display image element based on filetype', () => {
      component.fileType = 'image';
      fixture.detectChanges();

      const imageEle: HTMLElement = fixture.nativeElement.querySelector('app-img');
      const videoEle: HTMLElement = fixture.nativeElement.querySelector('video');
      const anyEle: HTMLElement = fixture.nativeElement.querySelector('div');
      expect(imageEle).toBeTruthy();
      expect(videoEle).toBeFalsy();
      expect(anyEle).toBeFalsy();
    });

    it('should display video element based on filetype', () => {
      component.fileType = 'video';
      fixture.detectChanges();

      const imageEle: HTMLElement = fixture.nativeElement.querySelector('app-img');
      const videoEle: HTMLElement = fixture.nativeElement.querySelector('video');
      const anyEle: HTMLElement = fixture.nativeElement.querySelector('div');
      expect(imageEle).toBeFalsy();
      expect(videoEle).toBeTruthy();
      expect(anyEle).toBeFalsy();
    });

    it('should display "any" element based on filetype', () => {
      component.fileType = 'any';
      fixture.detectChanges();

      const imageEle: HTMLElement = fixture.nativeElement.querySelector('app-img');
      const videoEle: HTMLElement = fixture.nativeElement.querySelector('video');
      const anyEle: HTMLElement = fixture.nativeElement.querySelector('div');
      expect(imageEle).toBeFalsy();
      expect(videoEle).toBeFalsy();
      expect(anyEle).toBeTruthy();
    });
  });

  describe('actionBtnClick()', () => {
    beforeEach(() => {
      component.removeFile.emit = spyOn(component.removeFile, 'emit');
    });

    it('should remove uploaded file', () => {
      component.fileType = 'not any';
      component.actionBtnClick({
        bucket: 'test-bucket',
        path: 'test-path',
        name: 'test-file',
        url: 'http://dummy.com',
        extension: 'jpg',
        type: 'image/jpeg',
        size: 1000
      } as TusFileResponse, 999);

      expect(component.removeFile.emit).toHaveBeenCalled();
    });

    it('should execute based on index code', fakeAsync(() => {
      component.fileType = 'any';

      component.actionBtnClick({
        bucket: 'test-bucket',
        path: 'test-path',
        name: 'test-file',
        url: 'http://dummy.com',
        extension: 'jpg',
        type: 'image/jpeg',
        size: 1000
      } as TusFileResponse, 0);

      // expect(component.removeFile.emit).toHaveBeenCalled();
      expect(utilsSpy.downloadFile).toHaveBeenCalled();

      component.actionBtnClick({
        bucket: 'test-bucket',
        path: 'test-path',
        name: 'test-file',
        url: 'http://dummy.com',
        extension: 'jpg',
        type: 'image/jpeg',
        size: 1000
      } as TusFileResponse, 1);

      tick();
      expect(filestackSpy.previewFile).toHaveBeenCalled();

      component.actionBtnClick({
        bucket: 'test-bucket',
        path: 'test-path',
        name: 'test-file',
        url: 'http://dummy.com',
        extension: 'jpg',
        type: 'image/jpeg',
        size: 1000
      } as TusFileResponse, 2);

      tick();
      expect(component.removeFile.emit).toHaveBeenCalled();
    }));
  });
});

