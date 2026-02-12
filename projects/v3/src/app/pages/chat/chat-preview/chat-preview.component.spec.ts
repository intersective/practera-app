import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { ChatPreviewComponent } from './chat-preview.component';
import { IonicModule, ModalController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import {
  HttpTestingController,
  HttpClientTestingModule
} from '@angular/common/http/testing';

describe('ChatPreviewComponent', () => {
  const TEST_URL = 'https://www.practera.com';
  let component: ChatPreviewComponent;
  let fixture: ComponentFixture<ChatPreviewComponent>;
  let modalSpy: ModalController;
  let domSanitizerSpy: DomSanitizer;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ IonicModule, CommonModule, HttpClientTestingModule ],
      declarations: [ ChatPreviewComponent ],
      providers: [
        ModalController,
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
    modalSpy = TestBed.inject(ModalController);
    domSanitizerSpy = TestBed.inject(DomSanitizer);

    // fixture.detectChanges();
  });

  it('should created', () => {
    expect(component).toBeTruthy();
  });

  it('should has toolbar to control modal content', () => {
    spyOn(window, 'open');
    spyOn(modalSpy, 'dismiss');

    component.file = { url: TEST_URL };
  });

  describe('download()', () => {
    it('should open and download from a URL', () => {
      spyOn(window, 'open');
      component.file = {
        url: TEST_URL
      };

      component.download();
      expect(window.open).toHaveBeenCalledWith(TEST_URL, '_system');
    });
  });

  describe('close()', () => {
    it('should close opened modal', () => {
      spyOn(modalSpy, 'dismiss');
      component.close();
      expect(modalSpy.dismiss).toHaveBeenCalled();
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
