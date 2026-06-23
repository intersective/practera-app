import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from "@angular/core/testing";
import { FilestackService } from "@v3/app/services/filestack.service";
import { of, Subject } from "rxjs";
import { VideoConversionComponent } from "./video-conversion.component";

describe('VideoConversionComponent', () => {
  let component: VideoConversionComponent;
  let fixture: ComponentFixture<VideoConversionComponent>;
  let filestackSpy: FilestackService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [VideoConversionComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: FilestackService,
          useValue: jasmine.createSpyObj('FilestackService', {
            'videoConversion': of({ status: 'completed' }),
            'previewModal': of(),
          }),
        },
      ],
    });

    fixture = TestBed.createComponent(VideoConversionComponent);
    component = fixture.componentInstance;
    filestackSpy = TestBed.inject(FilestackService);
  }));

  it('should created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should start with countdown for timeout', fakeAsync(() => {
      component.ngOnInit();
      expect(component.waitedTooLong).toBeFalse();
      tick(10000);
      expect(component.waitedTooLong).toBeTrue();
    }));
  });

  describe('ngOnChange()', () => {
    it('should act on video file which isn\'t an mp4', () => {
      const spy = spyOn(component, 'convertVideo');
      component.video = {
        fileObject: {
          mimetype: 'video/abc', // not mp4
        },
      };

      component.ngOnChanges({} as any);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('convertVideo()', () => {
    it('should perform filestack video conversion and wait', fakeAsync(() => {
      component.stop$ = new Subject<boolean>();
      component.convertVideo({ handle: 'abcdefg'});
      tick(10000);
      expect(component.result).toEqual({ status: 'completed' });
    }));
  });

  describe('showInFilestackPreview()', () => {
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
      component.showInFilestackPreview(file as any);
      expect(filestackSpy.previewModal).toHaveBeenCalledWith('http://practera.com', { url: 'http://streaming.com' });
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
      component.showInFilestackPreview(file as any, kbEvent);
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
      component.showInFilestackPreview(file as any, kbEvent);
      expect(spyKb).not.toHaveBeenCalled();
    });
  });
});
