import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import * as exif from 'exif-js';

import { ImgComponent } from './img.component';

describe('ImgComponent', () => {
  let component: ImgComponent;
  let fixture: ComponentFixture<ImgComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ImgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('image alt value', () => {
    it('should be empty string when "alt" is not provided', () => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.alt).toEqual('');
      });
    });

    it('should accept "alt" value', () => {
      const TEST_ALT = 'test';
      component.alt = TEST_ALT;
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.alt).toEqual(TEST_ALT);
        expect(fixture.nativeElement.querySelector('img').getAttribute('alt')).toEqual(TEST_ALT);
      });
    });
  });

  it('should set proxied image src for practera file URL on localhost', () => {
    const isLocalhost = /(^localhost$)|(^127\.)|(^::1$)/.test(window.location.hostname);
    if (!isLocalhost) {
      pending('requires localhost-like hostname');
    }
    component.imgSrc = 'https://file.practera.com/uploads/test-image.png';

    component.ngOnChanges({} as any);

    expect(component.proxiedImgSrc).toBe('/practera-proxy/uploads/test-image.png');
  });

  it('should not set proxied image src for non-practera URL', () => {
    component.imgSrc = 'https://example.com/uploads/test-image.png';

    component.ngOnChanges({} as any);

    expect(component.proxiedImgSrc).toBeUndefined();
  });

  it('should apply EXIF orientation class and swap dimensions for orientation >= 5', () => {
    const imageElement = {
      classList: jasmine.createSpyObj('classList', ['add']),
      height: 100,
      width: 200,
    } as any;
    const event = { target: imageElement };

    spyOn(exif, 'getData').and.callFake((image, callback: Function) => {
      callback.call(image);
      return undefined;
    });
    spyOn(exif, 'getAllTags').and.returnValue({ Orientation: 6 } as any);

    component.imageLoaded(event);

    expect(imageElement.classList.add).toHaveBeenCalledWith('rotate-90');
    expect(imageElement.height).toBe(200);
    expect(imageElement.width).toBe(100);
  });

  it('should not add class for unknown orientation', () => {
    const imageElement = {
      classList: jasmine.createSpyObj('classList', ['add']),
      height: 100,
      width: 200,
    } as any;
    const event = { target: imageElement };

    spyOn(exif, 'getData').and.callFake((image, callback: Function) => {
      callback.call(image);
      return undefined;
    });
    spyOn(exif, 'getAllTags').and.returnValue({ Orientation: 1 } as any);

    component.imageLoaded(event);

    expect(imageElement.classList.add).not.toHaveBeenCalled();
    expect(imageElement.height).toBe(100);
    expect(imageElement.width).toBe(200);
  });
});
