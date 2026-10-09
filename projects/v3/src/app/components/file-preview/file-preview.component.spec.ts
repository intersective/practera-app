import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FilePreviewComponent } from './file-preview.component';
import { IonicModule, ModalController } from '@ionic/angular/lazy';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { UtilsService } from '@v3/services/utils.service';
import {
  HttpTestingController,
  HttpClientTestingModule
} from '@angular/common/http/testing';

describe('FilePreviewComponent', () => {
  const TEST_URL = 'https://www.practera.com';
  let component: FilePreviewComponent;
  let fixture: ComponentFixture<FilePreviewComponent>;
  let modalSpy: ModalController;
  let domSanitizerSpy: DomSanitizer;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ IonicModule, CommonModule, HttpClientTestingModule ],
      declarations: [ FilePreviewComponent ],
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

    fixture = TestBed.createComponent(FilePreviewComponent);
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
      const utils = TestBed.inject(UtilsService);
      spyOn(utils, 'downloadFile');
      component.file = {
        url: TEST_URL
      };

      component.download();
      expect(utils.downloadFile).toHaveBeenCalledWith(TEST_URL, undefined);
    });
  });

  describe('close()', () => {
    it('should close opened modal', () => {
      component.close();
      expect(modalSpy.dismiss).toHaveBeenCalled();
    });
  });
});
