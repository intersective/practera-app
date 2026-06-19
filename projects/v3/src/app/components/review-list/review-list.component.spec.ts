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
      component.switchStatus();
      expect(spy).toHaveBeenCalledWith(component.reviews[1]);
      expect(component.showDone).toBeTrue();
      expect(component.segmentValue).toBe('completed');
      expect(component.resultsAnnouncement).toContain('completed');
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
      component.ngOnChanges({ reviews: new SimpleChange(null, component.reviews, false) });
      expect(component.noReviews).toEqual('');
    });

    it('should return "completed" when showDone but no completed reviews', () => {
      component.reviews = [
        { isDone: false } as any
      ];
      component.showDone = true;
      component.ngOnChanges({ reviews: new SimpleChange(null, component.reviews, false) });
      expect(component.noReviews).toEqual('completed');
    });

    it('should return "pending" when not showDone but no pending reviews', () => {
      component.reviews = [
        { isDone: true } as any
      ];
      component.showDone = false;
      component.ngOnChanges({ reviews: new SimpleChange(null, component.reviews, false) });
      expect(component.noReviews).toEqual('pending');
    });

    it('should hide default message when searching', () => {
      component.reviews = [
        { isDone: true, name: 'Completed review', submissionId: 2 } as any,
      ];
      component.showDone = true;
      component.ngOnChanges({ reviews: new SimpleChange(null, component.reviews, false) });
      component.onSearchTermChange('');
      component.onSearchTermChange('missing');
      expect(component.noReviews).toEqual('');
      expect(component.hasSearchWithoutResults).toBeTrue();
      expect(component.resultsAnnouncement).toContain('No');
    });
  });

  describe('onSearchTermChange()', () => {
    it('should filter reviews by title', () => {
      component.reviews = [
        { isDone: false, name: 'First review', submissionId: 1 } as any,
        { isDone: false, name: 'Second', submissionId: 2 } as any,
      ];
      component.showDone = false;
      component.ngOnChanges({ reviews: new SimpleChange(null, component.reviews, false) });
      component.onSearchTermChange('');
      component.onSearchTermChange('second');
      expect(component.filteredReviews.length).toBe(1);
      expect(component.filteredReviews[0].name).toBe('Second');
      expect(component.resultsAnnouncement).toContain('1');
    });
  });
});
