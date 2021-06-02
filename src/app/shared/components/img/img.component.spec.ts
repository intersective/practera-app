import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgComponent } from './img.component';

describe('ImgComponent', () => {
  let component: ImgComponent;
  let fixture: ComponentFixture<ImgComponent>;

  beforeEach(async(() => {
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
      const TEST_ALT = 'test'
      component.alt = TEST_ALT;
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.alt).toEqual(TEST_ALT);
        expect(fixture.nativeElement.querySelector('img').getAttribute('alt')).toEqual(TEST_ALT);
      });
    });
  });
});
