import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TestBed, ComponentFixture, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { FilestackComponent } from './filestack.component';
import { FilestackService } from '@v3/services/filestack.service';
import { UtilsService } from '@v3/app/services/utils.service';
import { TestUtils } from '@testingv3/utils';

describe('FilestackComponent', () => {
  let component: FilestackComponent;
  let fixture: ComponentFixture<FilestackComponent>;
  let filestackSpy: FilestackService;
  let utilsSpy: jasmine.SpyObj<UtilsService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule],
      declarations: [FilestackComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: FilestackService,
          useValue: jasmine.createSpyObj(['open', 'getS3Config'])
        }
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FilestackComponent);
    component = fixture.debugElement.componentInstance;
    filestackSpy = TestBed.inject(FilestackService);
    utilsSpy = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
  });

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
      utilsSpy.isMobile.and.returnValue(false);
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
