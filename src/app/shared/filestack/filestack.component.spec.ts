import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { FilestackComponent } from './filestack.component';
import { FilestackService } from './filestack.service';

describe('FilestackComponent', () => {
  let component: FilestackComponent;
  let fixture: ComponentFixture<FilestackComponent>;
  let filestackSpy: FilestackService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FilestackComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        FilestackService,
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FilestackComponent);
    component = fixture.debugElement.componentInstance;
    filestackSpy = TestBed.get(FilestackService);
  }));

  it('should create the filestack component', () => {
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should initiate variables', () => {
      const testFileType = 'test type';

      spyOn(filestackSpy, 'getFileTypes').and.returnValue(testFileType);
      component.ngOnInit();

      expect(component.fileTypes).toEqual(testFileType);
      expect(component['_showSavedAnswers']).toHaveBeenCalled();
    });
  });
});
