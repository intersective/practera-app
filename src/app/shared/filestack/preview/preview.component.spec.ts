import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { PreviewComponent } from './preview.component';
import { IonicModule, ModalController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import {
  HttpTestingController,
  HttpClientTestingModule
} from '@angular/common/http/testing';

describe('PreviewComponent', () => {
  const TEST_URL = 'https://www.practera.com';
  let component: PreviewComponent;
  let fixture: ComponentFixture<PreviewComponent>;
  let modalSpy: ModalController;
  let domSanitizerSpy: DomSanitizer;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ IonicModule, CommonModule, HttpClientTestingModule ],
      declarations: [ PreviewComponent ],
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

    fixture = TestBed.createComponent(PreviewComponent);
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
    component.url = TEST_URL;
    // fixture.detectChanges();

    // const iconBtns: DebugElement[] = fixture.debugElement.queryAll(By.css('ion-icon'));
    // const download: HTMLElement = iconBtns[0].nativeElement;
    // const close: HTMLElement = iconBtns[1].nativeElement;

    // download.click();
    // expect(window.open).toHaveBeenCalledWith(TEST_URL, '_system');

    // close.click();
    // expect(modalSpy.dismiss).toHaveBeenCalled();
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
