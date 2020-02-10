import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, async, ComponentFixture, fakeAsync, flushMicrotasks } from '@angular/core/testing';
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

  describe('uploadFile()', () => {
    it('should open filestack fileupload window', fakeAsync(() => {
      const respond = { fileupload: true };
      let result;

      spyOn(filestackSpy, 'open').and.returnValue(Promise.resolve(respond));
      spyOn(filestackSpy, 'getS3Config');

      component.uploadFile().then(data => {
        result = data;
      });
      flushMicrotasks();

      expect(filestackSpy.getS3Config).toHaveBeenCalled();
      expect(filestackSpy.open).toHaveBeenCalled();
    }));
  });
});
