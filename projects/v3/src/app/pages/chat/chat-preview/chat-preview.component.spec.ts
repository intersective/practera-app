import { TestBed, waitForAsync, ComponentFixture } from '@angular/core/testing';
import { ChatPreviewComponent } from './chat-preview.component';
import { IonicModule, ModalController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('ChatPreviewComponent', () => {
  const TEST_URL = 'https://www.practera.com';
  let component: ChatPreviewComponent;
  let fixture: ComponentFixture<ChatPreviewComponent>;
  let modalSpy: jasmine.SpyObj<ModalController>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ IonicModule, CommonModule ],
      declarations: [ ChatPreviewComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ModalController,
          useValue: jasmine.createSpyObj('ModalController', ['dismiss']),
        },
        {
          provide: DomSanitizer,
          useValue: {
            sanitize: () => 'safeString',
            bypassSecurityTrustHtml: () => 'safeString',
            bypassSecurityTrustResourceUrl: () => 'safeString',
          },
        },
      ],
    });

    fixture = TestBed.createComponent(ChatPreviewComponent);
    component = fixture.componentInstance;
    modalSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
  }));

  it('should created', () => {
    expect(component).toBeTruthy();
  });

  it('should hold file input data', () => {
    component.file = { url: TEST_URL };

    expect(component.file.url).toBe(TEST_URL);
  });

  describe('previewUrl', () => {
    it('should render the immediate preview URL when it is available', () => {
      const directUrl = 'https://uploads.example.com/chat/image.png?token=direct';
      component.file = {
        type: 'image/png',
        url: 'https://cdn.example.com/chat/image.png',
        preview: directUrl,
      };

      fixture.detectChanges();

      const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
      expect(component.previewUrl).toBe(directUrl);
      expect(image.src).toBe(directUrl);
    });

    it('should fall back to the canonical URL for sent attachments', () => {
      component.file = { url: TEST_URL };

      expect(component.previewUrl).toBe(TEST_URL);
    });
  });

  describe('download()', () => {
    it('should open the immediate preview URL when it is available', () => {
      spyOn(window, 'open');
      component.file = {
        url: TEST_URL,
        preview: 'https://uploads.example.com/chat/image.png?token=direct',
      };

      component.download();
      expect(window.open).toHaveBeenCalledWith(component.file.preview, '_system');
    });

    it('should fall back to the canonical URL for sent attachments', () => {
      spyOn(window, 'open');
      component.file = { url: TEST_URL };

      component.download();

      expect(window.open).toHaveBeenCalledWith(TEST_URL, '_system');
    });

    it('should open and prevent default for enter/space keyboard actions', () => {
      spyOn(window, 'open');
      const keyboardEvent = {
        code: 'Enter',
        preventDefault: jasmine.createSpy('preventDefault'),
      } as any;
      component.file = {
        url: TEST_URL,
        preview: 'https://uploads.example.com/chat/image.png?token=direct',
      };

      component.download(keyboardEvent);

      expect(keyboardEvent.preventDefault).toHaveBeenCalled();
      expect(window.open).toHaveBeenCalledWith(component.file.preview, '_system');
    });

    it('should ignore unsupported keyboard key in download', () => {
      spyOn(window, 'open');
      const keyboardEvent = {
        code: 'KeyA',
        preventDefault: jasmine.createSpy('preventDefault'),
      } as any;

      component.download(keyboardEvent);

      expect(keyboardEvent.preventDefault).not.toHaveBeenCalled();
      expect(window.open).not.toHaveBeenCalled();
    });
  });

  describe('close()', () => {
    it('should close opened modal', () => {
      component.close();

      expect(modalSpy.dismiss).toHaveBeenCalled();
    });

    it('should close and prevent default for keyboard enter/space', () => {
      const keyboardEvent = {
        code: 'Space',
        preventDefault: jasmine.createSpy('preventDefault'),
      } as any;

      component.close(keyboardEvent);

      expect(keyboardEvent.preventDefault).toHaveBeenCalled();
      expect(modalSpy.dismiss).toHaveBeenCalled();
    });

    it('should ignore unsupported keyboard key in close', () => {
      const keyboardEvent = {
        code: 'Escape',
        preventDefault: jasmine.createSpy('preventDefault'),
      } as any;

      component.close(keyboardEvent);

      expect(keyboardEvent.preventDefault).not.toHaveBeenCalled();
      expect(modalSpy.dismiss).not.toHaveBeenCalled();
    });
  });

  describe('isBrowserSupportedVideo', () => {
    it('should return true for mp4', () => {
      component.file = { url: 'video.mp4', type: 'video/mp4' };
      expect(component.isBrowserSupportedVideo()).toBeTrue();
    });

    it('should return true for webm', () => {
      component.file = { url: 'video.webm', type: 'video/webm' };
      expect(component.isBrowserSupportedVideo()).toBeTrue();
    });

    it('should return true for ogg', () => {
      component.file = { url: 'video.ogg', type: 'video/ogg' };
      expect(component.isBrowserSupportedVideo()).toBeTrue();
    });

    it('should return false for unsupported video types', () => {
      component.file = { url: 'video.avi', type: 'video/avi' };
      expect(component.isBrowserSupportedVideo()).toBeFalse();
    });

    it('should return false when file type is not set', () => {
      component.file = { url: 'video.mp4' };
      expect(component.isBrowserSupportedVideo()).toBeFalse();
    });
  });

  describe('handleVideoError', () => {
    it('should log error details', () => {
      spyOn(console, 'error');
      const mockEvent = { target: { error: { code: 4, message: 'not supported' }, src: 'test.mp4', networkState: 3, readyState: 0 } } as any;
      component.handleVideoError(mockEvent);
      expect(console.error).toHaveBeenCalledWith('Video Error::', mockEvent);
    });
  });
});
