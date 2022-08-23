import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, pipe } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { UtilsService } from '@services/utils.service';
import { ReviewRatingComponent } from './review-rating.component';
import { ReviewRatingService } from '@v3/services/review-rating.service';
import { ModalController } from '@ionic/angular';
import { FastFeedbackService } from '@v3/services/fast-feedback.service';
import { TestUtils } from '@testingv3/utils';
import { NotificationsService } from '@v3/services/notifications.service';

describe('ReviewRatingComponent', () => {
  let component: ReviewRatingComponent;
  let fixture: ComponentFixture<ReviewRatingComponent>;
  let serviceSpy: jasmine.SpyObj<ReviewRatingService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let fastfeedbackSpy: jasmine.SpyObj<FastFeedbackService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      declarations: [ReviewRatingComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationService', ['alert']),
        },
        {
          provide: ReviewRatingService,
          useValue: jasmine.createSpyObj('ReviewRatingService', ['submitRating'])
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
            events: of()
          }
        },
        {
          provide: ModalController,
          useValue: {
            dismiss: jasmine.createSpy('dismiss')
          }
        },
        {
          provide: FastFeedbackService,
          useValue: jasmine.createSpyObj('FastFeedbackService', {
            pullFastFeedback: of(true)
          })
        },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewRatingComponent);
    component = fixture.componentInstance;
    serviceSpy = TestBed.inject(ReviewRatingService) as jasmine.SpyObj<ReviewRatingService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fastfeedbackSpy = TestBed.inject(FastFeedbackService) as jasmine.SpyObj<FastFeedbackService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when testing submitReviewRating()', () => {
    afterEach(() => {
      component.ratingData = {
        assessment_review_id: 1,
        rating: 0.123,
        comment: '',
        tags: []
      };
      serviceSpy.submitRating.and.returnValue(of(''));
      component.submitReviewRating();
      expect(serviceSpy.submitRating.calls.count()).toBe(1);
      expect(serviceSpy.submitRating.calls.first().args[0].rating).toEqual(0.12);
      expect(component.isSubmitting).toBe(false);
      if (component.redirect) {
        expect(routerSpy.navigate.calls.first().args[0]).toEqual(component.redirect);
      } else {
        expect(routerSpy.navigate.calls.count()).toBe(0);
      }
    });
    it('should submit rating', () => {
      component.redirect = null;
    });
    it('should submit rating and navigate', () => {
      component.redirect = ['home'];
    });
  });

  describe('submitReviewRating() - straightforward test', () => {
    it('should trigger pulse check API when stay on same view', () => {
      component.redirect = null;

      component.ratingData = {
        assessment_review_id: 1,
        rating: 0.123,
        comment: '',
        tags: []
      };
      serviceSpy.submitRating.and.returnValue(of(''));
      component.submitReviewRating();
      expect(serviceSpy.submitRating.calls.count()).toBe(1);
      expect(serviceSpy.submitRating.calls.first().args[0].rating).toEqual(0.12);
      expect(component.isSubmitting).toBe(false);
      expect(routerSpy.navigate.calls.count()).toBe(0);
      expect(fastfeedbackSpy.pullFastFeedback).toHaveBeenCalledTimes(1);
    });
  });

  it('when testing addOrRemoveTags', () => {
    component.ratingData.tags = ['a', 'b'];
    component.addOrRemoveTags('c');
    expect(component.ratingData.tags).toEqual(['a', 'b', 'c']);
    component.addOrRemoveTags('b');
    expect(component.ratingData.tags).toEqual(['a', 'c']);
  });

});
