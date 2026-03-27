/* eslint-disable no-console */
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks, waitForAsync, tick } from '@angular/core/testing';
import { FileDisplayComponent } from './file-display.component';
import { FilestackService } from '@v3/services/filestack.service';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { UtilsService } from '@v3/services/utils.service';
import { TestUtils } from '@testingv3/utils';
import { environment } from '@v3/environments/environment';
import { FileInput, TusFileResponse } from '../types/assessment';
import { ModalController } from '@ionic/angular';

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
        {
          provide: ModalController,
          useValue: jasmine.createSpyObj('ModalController', {
            create: Promise.resolve({ present: jasmine.createSpy('present').and.returnValue(Promise.resolve()) }),
            dismiss: Promise.resolve()
          })
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

  it('should preview file with modal', async () => {
    const modalControllerSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    await component.previewFile({
      bucket: 'test-bucket',
      path: 'test-path',
      name: 'test-file',
      url: 'DUMMY_URL',
      extension: 'jpg',
      type: 'image/jpeg',
      size: 1000
    });
    expect(modalControllerSpy.create).toHaveBeenCalled();
  });

  it('should open application files in new window', async () => {
    spyOn(window, 'open');
    component.file = {
      bucket: 'test-bucket',
      path: 'test-path',
      name: 'test-file.pdf',
      filename: 'test-file.pdf',
      url: 'DUMMY_URL',
      extension: 'pdf',
      type: 'application/pdf',
      mimetype: 'application/pdf',
      size: 1000,
      directUrl: 'DUMMY_URL',
      cdnUrl: 'DUMMY_URL',
    };
    await component.previewFile({
      bucket: 'test-bucket',
      path: 'test-path',
      name: 'test-file.pdf',
      url: 'DUMMY_URL',
      extension: 'pdf',
      type: 'application/pdf',
      size: 1000
    });
    expect(window.open).toHaveBeenCalledWith('DUMMY_URL', '_system');
  });

  describe('UI logic', () => {
    const url = 'test.com/uilogic';
    beforeEach(() => {
      component.file = {
        bucket: 'test-bucket',
        path: 'test-path',
        name: 'test-file',
        filename: 'test-file',
        url: url,
        extension: 'jpg',
        type: 'image/jpeg',
        mimetype: 'image/jpeg',
        size: 1000,
        directUrl: url,
        cdnUrl: url,
      };
    });
    it('should display image element based on filetype', () => {
      component.fileType = 'image';
      fixture.detectChanges();

      const imageEle: HTMLElement = fixture.nativeElement.querySelector('app-img');
      const videoEle: HTMLElement = fixture.nativeElement.querySelector('video');
      expect(imageEle).toBeTruthy();
      expect(videoEle).toBeFalsy();
    });

    it('should display video element based on filetype', () => {
      component.fileType = 'video';
      fixture.detectChanges();

      const imageEle: HTMLElement = fixture.nativeElement.querySelector('app-img');
      const videoEle: HTMLElement = fixture.nativeElement.querySelector('video');
      expect(imageEle).toBeFalsy();
      expect(videoEle).toBeTruthy();
    });

    it('should display list-item element for "any" filetype', () => {
      component.fileType = 'any';
      fixture.detectChanges();

      const imageEle: HTMLElement = fixture.nativeElement.querySelector('app-img');
      const videoEle: HTMLElement = fixture.nativeElement.querySelector('video');
      const listItemEle: HTMLElement = fixture.nativeElement.querySelector('app-list-item');
      expect(imageEle).toBeFalsy();
      expect(videoEle).toBeFalsy();
      expect(listItemEle).toBeTruthy();
    });
  });

  describe('actionBtnClick()', () => {
    beforeEach(() => {
      component.removeFile.emit = spyOn(component.removeFile, 'emit');
    });

    it('should download file when index is 0', () => {
      component.actionBtnClick({
        bucket: 'test-bucket',
        path: 'test-path',
        name: 'test-file',
        url: 'http://dummy.com',
        directUrl: 'http://dummy.com/direct',
        extension: 'jpg',
        type: 'image/jpeg',
        size: 1000
      } as TusFileResponse, 0);

      expect(utilsSpy.downloadFile).toHaveBeenCalled();
    });

    it('should remove uploaded file when index is 1', () => {
      component.actionBtnClick({
        bucket: 'test-bucket',
        path: 'test-path',
        name: 'test-file',
        url: 'http://dummy.com',
        extension: 'jpg',
        type: 'image/jpeg',
        size: 1000
      } as TusFileResponse, 1);

      expect(component.removeFile.emit).toHaveBeenCalled();
    });
  });
});

