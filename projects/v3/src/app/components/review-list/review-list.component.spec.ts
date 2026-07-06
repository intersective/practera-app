import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ReviewListComponent } from './review-list.component';

describe('ReviewListComponent', () => {
  let component: ReviewListComponent;
  let fixture: ComponentFixture<ReviewListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewListComponent ],
      imports: [IonicModule.forRoot(), FormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should showDone = false', () => {
      component.ngOnInit();
      expect(component.showDone).toEqual(false);
    });
  });

  describe('goto()', () => {
    it('should navigate to a review', () => {
      const spy = spyOn(component.navigate, 'emit');
      component.goto({} as any);
      expect(spy).toHaveBeenCalled();
    });

    it('should navigate to a review with keyboardEvent', () => {
      const kbEvent = new KeyboardEvent('keydown', {
        code: 'Enter',
        key: 'Enter',
      });
      const spy = spyOn(component.navigate, 'emit');
      const spyKbEvent = spyOn(kbEvent, 'preventDefault');
      component.goto({} as any, kbEvent);

      expect(spy).toHaveBeenCalled();
      expect(spyKbEvent).toHaveBeenCalled();
    });
  });

  describe('switchStatus()', () => {
    it('should toggle showDone and navigate to first matching review', () => {
      component.reviews = [
        { isDone: false, name: 'Pending review', submissionId: 1 } as any,
        { isDone: true, name: 'Completed review', submissionId: 2 } as any,
      ];
      component.currentReview = component.reviews[0];
      component.goToFirstOnSwitch = true;
      const spy = spyOn(component.navigate, 'emit');
      const mockEvent = { detail: { value: 'completed' } } as CustomEvent<any>;
      component.switchStatus(mockEvent);
      expect(spy).toHaveBeenCalledWith(component.reviews[1]);
      expect(component.showDone).toBeTrue();
    });
  });

  describe('noReviews()', () => {
    it('should be empty string when reviews is null', () => {
      component.reviews = null;
      expect(component.noReviews).toEqual('');
    });

    it('should be empty string when matching reviews exist', () => {
      component.showDone = true;
      component.reviews = [{
        isDone: true,
      } as any];
      component.filteredReviews = component.reviews as any;
      expect(component.noReviews).toEqual('');
    });

    it('should return "completed" when showDone but no completed reviews', () => {
      component.reviews = [
        { isDone: false } as any
      ];
      component.showDone = true;
      expect(component.noReviews).toEqual('completed');
    });

    it('should return "pending" when not showDone but no pending reviews', () => {
      component.reviews = [
        { isDone: true } as any
      ];
      component.showDone = false;
      expect(component.noReviews).toEqual('pending');
    });
  });
});
