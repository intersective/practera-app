import { TestBed, waitForAsync, ComponentFixture } from '@angular/core/testing';
import { ChatPreviewComponent } from './chat-preview.component';
import { IonicModule, ModalController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ChatPreviewComponent', () => {
  const TEST_URL = 'https://www.practera.com';
  let component: ChatPreviewComponent;
  let fixture: ComponentFixture<ChatPreviewComponent>;
  let modalSpy: jasmine.SpyObj<ModalController>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ IonicModule, CommonModule, HttpClientTestingModule ],
      declarations: [ ChatPreviewComponent ],
      providers: [
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

  describe('download()', () => {
    it('should open and download from a URL', () => {
      spyOn(window, 'open');
      component.file = {
        url: TEST_URL
      };

      component.download();
      expect(window.open).toHaveBeenCalledWith(TEST_URL, '_system');
    });

    it('should open and prevent default for enter/space keyboard actions', () => {
      spyOn(window, 'open');
      const keyboardEvent = {
        code: 'Enter',
        preventDefault: jasmine.createSpy('preventDefault'),
      } as any;
      component.file = { url: TEST_URL };

      component.download(keyboardEvent);

      expect(keyboardEvent.preventDefault).toHaveBeenCalled();
      expect(window.open).toHaveBeenCalledWith(TEST_URL, '_system');
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
});
