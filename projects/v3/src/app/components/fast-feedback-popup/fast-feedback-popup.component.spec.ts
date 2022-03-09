import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FastFeedbackPopupComponent } from './fast-feedback-popup.component';

describe('FastFeedbackPopupComponent', () => {
  let component: FastFeedbackPopupComponent;
  let fixture: ComponentFixture<FastFeedbackPopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FastFeedbackPopupComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FastFeedbackPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
