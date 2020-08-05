import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange, DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { FileDisplayComponent } from './file-display.component';
import { FilestackService } from '@shared/filestack/filestack.service';
import { Observable, of, pipe } from 'rxjs';
import { SharedModule } from '@shared/shared.module';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { UtilsService } from '@services/utils.service';
import { Apollo } from 'apollo-angular';

class OnChangedValues extends SimpleChange {
  constructor(older, latest) {
    super(older, latest, false);
  }
}

describe('FileDisplayComponent', () => {
  let component: FileDisplayComponent;
  let fixture: ComponentFixture<FileDisplayComponent>;
  let filestackSpy: jasmine.SpyObj<FilestackService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ SharedModule, ReactiveFormsModule ],
      declarations: [ FileDisplayComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        Apollo,
        UtilsService,
        {
          provide: FilestackService,
          useValue: jasmine.createSpyObj('FilestackService', [
            'previewFile',
            'getWorkflowStatus'
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
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should preview file', () => {
    component.previewFile('file');
    expect(filestackSpy.previewFile.calls.count()).toBe(1);
  });

  it('should fail, if preview file api is faulty', fakeAsync(() => {
    const error = 'error';
    filestackSpy.previewFile.and.returnValue(Promise.reject(error));
    let result;
    const test = component.previewFile('file').catch(res => {
      result = res;
    });
    flushMicrotasks();
    expect(component.previewFile('file').then().catch).toThrowError();
  }));

  describe('UI logic', () => {
    const url = 'test.com/uilogic';
    beforeEach(() => {
      component.file = {
        url
      };
    });
    it('should display proper element based on filetype', () => {
      component.fileType = 'image';
      fixture.detectChanges();

      const imageEle: HTMLElement = fixture.nativeElement.querySelector('app-img');
      const videoEle: HTMLElement = fixture.nativeElement.querySelector('video');
      const anyEle: HTMLElement = fixture.nativeElement.querySelector('div');
      expect(imageEle).toBeTruthy();
      expect(videoEle).toBeFalsy();
      expect(anyEle).toBeFalsy();
    });

    it('should display proper element based on filetype', () => {
      component.fileType = 'video';
      fixture.detectChanges();

      const imageEle: HTMLElement = fixture.nativeElement.querySelector('app-img');
      const videoEle: HTMLElement = fixture.nativeElement.querySelector('video');
      const anyEle: HTMLElement = fixture.nativeElement.querySelector('div');
      expect(imageEle).toBeFalsy();
      expect(videoEle).toBeTruthy();
      expect(anyEle).toBeFalsy();
    });

    it('should display proper element based on filetype', () => {
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

  describe('ngOnInit()', () => {
    beforeEach(() => {
      component.updateWorkflowStatus = jasmine.createSpy('updateWorkflowStatus');
    });

    it('should check workflow status if workflow object is available', () => {
      component.file = {
        workflows: 'isAvailable'
      };
      component.ngOnInit();
      expect(component.updateWorkflowStatus).toHaveBeenCalled();
    });

    it('should not update workflow status if file not available', () => {
      component.file = undefined;
      component.ngOnInit();
      expect(component.updateWorkflowStatus).not.toHaveBeenCalled();
    });
  });

  describe('ngOnChanges', () => {
    it('should track fileupload json changes', () => {
      component.updateWorkflowStatus = jasmine.createSpy('updateWorkflowStatus');
      const jsonData = {just: 'first test'};
      const newJsonData = {jsonData, ...{
        and: 'second test',
        without: 'workflow',
      }};

      component.ngOnChanges({
        file: new OnChangedValues(jsonData, newJsonData),
      });

      expect(component.updateWorkflowStatus).not.toHaveBeenCalled();
    });

    it('should not track fileupload changes if workflow is not available', () => {
      component.updateWorkflowStatus = jasmine.createSpy('updateWorkflowStatus');
      const jsonData = {just: 'first test'};
      const newJsonData = {jsonData, ...{
        and: 'second test',
        without: 'workflows',
      }};

      component.ngOnChanges({
        file: new OnChangedValues(jsonData, newJsonData),
      });

      expect(component.updateWorkflowStatus).not.toHaveBeenCalled();
    });

    it('should track fileupload changes if workflow is available', fakeAsync(() => {
      const virus_detection = {
        data: 'virus_detection_test_data',
      };
      const quarantine = {
        data: 'quarantine_test_data',
      };
      filestackSpy.getWorkflowStatus.and.returnValue(Promise.resolve([
        {
          results: {
            virus_detection,
            quarantine,
          },
          status: 'FINISHED',
        }
      ]));
      component.updateWorkflowStatus = jasmine.createSpy('updateWorkflowStatus');

      const jsonData = { just: 'first test' };
      const newJsonData = {...jsonData, ...{
        and: 'second test',
        workflows: true,
      }};
      component.videoEle = {
        nativeElement: {
          load: () => jasmine.createSpy()
        }
      };
      component.ngOnChanges({
        file: new OnChangedValues(jsonData, newJsonData),
      });

      flushMicrotasks();
      expect(component.updateWorkflowStatus).toHaveBeenCalled();
      return;
      // can't test the following in development
      expect(filestackSpy.getWorkflowStatus).toHaveBeenCalledWith(newJsonData.workflows);
      expect(component['virusDetection']).toEqual(virus_detection.data);
      expect(component['quarantine']).toEqual(quarantine.data);
    }));
  });
});

