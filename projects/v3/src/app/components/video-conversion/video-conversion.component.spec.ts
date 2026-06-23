import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from "@angular/core/testing";
import { FilePreviewService } from "@v3/app/services/file-preview.service";
import { of, Subject } from "rxjs";
import { VideoConversionComponent } from "./video-conversion.component";

describe('VideoConversionComponent', () => {
  let component: VideoConversionComponent;
  let fixture: ComponentFixture<VideoConversionComponent>;
  let filePreviewSpy: jasmine.SpyObj<FilePreviewService>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [VideoConversionComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: FilePreviewService,
          useValue: jasmine.createSpyObj('FilePreviewService', {
            'openModal': Promise.resolve(),
          }),
        },
      ],
    });

    fixture = TestBed.createComponent(VideoConversionComponent);
    component = fixture.componentInstance;
    filePreviewSpy = TestBed.inject(FilePreviewService) as jasmine.SpyObj<FilePreviewService>;
  }));

  it('should created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should be a no-op after filestack removal', () => {
      component.ngOnInit();
      expect(component.waitedTooLong).toBeFalse();
    });
  });

  describe('ngOnChange()', () => {
    it('should show download fallback for non-mp4 video', () => {
      component.video = {
        fileObject: {
          mimetype: 'video/abc',
        },
      };

      component.ngOnChanges({} as any);
      expect(component.waitedTooLong).toBeTrue();
    });
  });

  describe('showPreview()', () => {
    it('should show video in streaming URL', () => {
      const file = {
        data: {
          url: 'http://practera.com',
        },
      };

      component.video = {
        fileObject: {
          url: 'http://streaming.com',
        },
      };
      component.showPreview(file as any);
      expect(filePreviewSpy.openModal).toHaveBeenCalledWith('http://practera.com', { url: 'http://streaming.com' });
    });

    it('should allow keyboard event', () => {
      const file = {
        data: {
          url: 'http://practera.com',
        },
      };

      component.video = {
        fileObject: {
          url: 'http://streaming.com',
        },
      };

      const kbEvent = new KeyboardEvent('keydown', {
        code: 'Enter',
        key: 'Enter',
      });
      const spyKb = spyOn(kbEvent, 'preventDefault');
      component.showPreview(file as any, kbEvent);
      expect(spyKb).toHaveBeenCalled();
    });

    it('should prevent wrong keyboard event', () => {
      const file = {
        data: {
          url: 'http://practera.com',
        },
      };

      component.video = {
        fileObject: {
          url: 'http://streaming.com',
        },
      };

      const kbEvent = new KeyboardEvent('keydown', {
        code: 'Tab',
        key: 'Tab',
      });
      const spyKb = spyOn(kbEvent, 'preventDefault');
      component.showPreview(file as any, kbEvent);
      expect(spyKb).not.toHaveBeenCalled();
    });
  });
});
