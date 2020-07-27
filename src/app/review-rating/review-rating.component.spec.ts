import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, pipe } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { UtilsService } from '@services/utils.service';
import { ReviewRatingComponent } from './review-rating.component';
import { ReviewRatingService } from './review-rating.service';
import { ModalController } from '@ionic/angular';
import { Apollo } from 'apollo-angular';

describe('ReviewRatingComponent', () => {
  let component: ReviewRatingComponent;
  let fixture: ComponentFixture<ReviewRatingComponent>;
  let serviceSpy: jasmine.SpyObj<ReviewRatingService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      declarations: [ ReviewRatingComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        Apollo,
        UtilsService,
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
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewRatingComponent);
    component = fixture.componentInstance;
    serviceSpy = TestBed.inject(ReviewRatingService) as jasmine.SpyObj<ReviewRatingService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
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

  it('when testing addOrRemoveTags', () => {
    component.ratingData.tags = ['a', 'b'];
    component.addOrRemoveTags('c');
    expect(component.ratingData.tags).toEqual(['a', 'b', 'c']);
    component.addOrRemoveTags('b');
    expect(component.ratingData.tags).toEqual(['a', 'c']);
  });

});
