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
});
