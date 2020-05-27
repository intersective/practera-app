import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { TestBed, async, ComponentFixture, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { FilestackComponent } from './filestack.component';
import { FilestackService } from './filestack.service';

describe('FilestackComponent', () => {
  let component: FilestackComponent;
  let fixture: ComponentFixture<FilestackComponent>;
  let filestackSpy: FilestackService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ IonicModule ],
      declarations: [FilestackComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: FilestackService,
          useValue: jasmine.createSpyObj(['open', 'getS3Config'])
        }
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FilestackComponent);
    component = fixture.debugElement.componentInstance;
    filestackSpy = TestBed.inject(FilestackService);
  }));

  it('should create the filestack component', () => {
    expect(component).toBeTruthy();
  });

  describe('uploadFile()', () => {
    it('should display "Upload File" by default (and not "profileImage")', () => {
      component.type = 'anything';
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('ion-button');

      expect(button.textContent).toEqual('UPLOAD FILE');
    });

    it('should allow upload profile picture', () => {
      component.type = 'profileImage';
      fixture.detectChanges();

      const button: HTMLElement = fixture.nativeElement.querySelector('p');

      expect(button.classList).toContain('upload-icon');
    });

    it('should open filestack fileupload window', fakeAsync(() => {
      const respond = { fileupload: true };
      let result;

      filestackSpy.open = jasmine.createSpy('open').and.returnValue(Promise.resolve(respond));

      component.uploadFile().then(data => {
        result = data;
      });
      flushMicrotasks();

      expect(filestackSpy.getS3Config).toHaveBeenCalled();
      expect(filestackSpy.open).toHaveBeenCalled();
    }));
  });
});
