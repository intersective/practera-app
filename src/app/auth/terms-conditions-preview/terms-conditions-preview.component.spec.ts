import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsConditionsPreviewComponent } from './terms-conditions-preview.component';

describe('TermsConditionsPreviewComponent', () => {
  let component: TermsConditionsPreviewComponent;
  let fixture: ComponentFixture<TermsConditionsPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TermsConditionsPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsConditionsPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
