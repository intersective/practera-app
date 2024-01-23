import { ComponentFixture, TestBed } from '@angular/core/testing';

import { H5pComponent } from './h5p.component';

describe('H5pComponent', () => {
  let component: H5pComponent;
  let fixture: ComponentFixture<H5pComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [H5pComponent]
    });
    fixture = TestBed.createComponent(H5pComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
