import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { ReviewsComponent } from './reviews.component';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MockRouter } from '@testing/mocked.service';
import { ActivatedRouteStub } from '@testing/activated-route-stub';
import { ReviewListComponent } from '../review-list/review-list.component';

describe('ReviewsComponent', () => {
  let fixture: ComponentFixture<ReviewsComponent>;
  let component: ReviewsComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ ReviewsComponent ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: new ActivatedRouteStub({submissionId: 1}),
        },
        {
          provide: Router,
          useClass: MockRouter
        }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewsComponent);
    component = fixture.componentInstance;
  });

  it('should created', () => {
    expect(component).toBeTruthy();
  });

  describe('onEnter()', () => {
    it('should get submissionId from paramMap', fakeAsync(() => {
      const childOnEnter = jasmine.createSpy('onEnter');
      component.reviewList = { onEnter: childOnEnter };
      component.onEnter();
      tick(1000);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.submissionId).toEqual(1);
        expect(childOnEnter).toHaveBeenCalled();
      });
    }));
  });

  describe('goto()', () => {
    it('should set all ids based on the targetted event', fakeAsync(() => {
      const childOnEnter = jasmine.createSpy('onEnter');
      component.assessment = { onEnter: childOnEnter };

      component.goto({
        assessmentId: 1,
        submissionId: 2,
        contextId: 3,
      });

      expect(component.assessmentId).toEqual(1);
      expect(component.submissionId).toEqual(2);
      expect(component.contextId).toEqual(3);

      tick(1000);
      expect(childOnEnter).toHaveBeenCalled();
    }));

    it('should cancel out event if provided event is empty', () => {
      component.goto(false);
      expect(component.submissionId).toBeNull();
    });
  });
});
