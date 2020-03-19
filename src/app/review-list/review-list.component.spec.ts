import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewListComponent } from './review-list.component';
import { ReviewListService } from './review-list.service';
import { Observable, of, pipe } from 'rxjs';
import { Router } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { UtilsService } from '@services/utils.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import {
  HttpTestingController,
  HttpClientTestingModule
} from '@angular/common/http/testing';
import { NotificationService } from '@shared/notification/notification.service';
import { MockRouter } from '@testing/mocked.service';

describe('ReviewListComponent', () => {
  let component: ReviewListComponent;
  let fixture: ComponentFixture<ReviewListComponent>;
  let serviceSpy: jasmine.SpyObj<ReviewListService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let utils: UtilsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, HttpClientTestingModule],
      declarations: [ ReviewListComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        UtilsService,
        NewRelicService,
        NotificationService,
        {
          provide: ReviewListService,
          useValue: jasmine.createSpyObj('ReviewListService', ['getReviews'])
        },
        {
          provide: Router,
          useClass: MockRouter
        },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewListComponent);
    component = fixture.componentInstance;
    serviceSpy = TestBed.inject(ReviewListService) as jasmine.SpyObj<ReviewListService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    utils = TestBed.inject(UtilsService);
  });

  it('should get the correct data onEnter()', () => {
    const reviews = Array.from({length: 5}, (x, i) => {
      return {
        assessmentId: i + 1,
        submissionId: i + 2,
        isDone: i > 3,
        name: 'Assessment' + i,
        submitterName: 'Submitter' + i,
        date: utils.timeFormatter('2019-02-01'),
        teamName: '',
        contextId: i + 3
      };
    });
    serviceSpy.getReviews.and.returnValue(of(reviews));
    component.onEnter();

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.reviews).toEqual(reviews);
      expect(component.showDone).toBe(false);
      expect(component.loadingReviews).toBe(false);
    });
  });

  it ('should emit navigate event (desktop)', () => {
    const contextId = 1;
    const assessmentId = 2;
    const submissionId = 3;

    spyOn(utils, 'isMobile').and.returnValue(false);
    spyOn(component.navigate, 'emit');
    component.gotoReview(contextId, assessmentId, submissionId);

    expect(component.navigate.emit).toHaveBeenCalledWith({
      assessmentId,
      submissionId,
      contextId,
    });
      // ['assessment', 'review', 1, 2, 3, {from: 'reviews'}]);
  });

  it('should navigate to the correct page gotoReview() (mobile)', () => {
    spyOn(utils, 'isMobile').and.returnValue(true);
    component.gotoReview(1, 2, 3);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['assessment', 'review', 1, 2, 3, {from: 'reviews'}]);
  });

  it('should return false if showing done, noReviewsToDo()', () => {
    serviceSpy.getReviews.and.returnValue(of(Array.from({length: 5}, (x, i) => {
      return {
        assessmentId: i + 1,
        submissionId: i + 2,
        isDone: true,
        name: 'Assessment' + i,
        submitterName: 'Submitter' + i,
        date: utils.timeFormatter('2019-02-01'),
        teamName: '',
        contextId: i + 3
      };
    })));
    fixture.detectChanges();
    expect(component.noReviewsToDo()).toBe(true);
  });

  it('should return false if showing done, noReviewsDone()', () => {
    serviceSpy.getReviews.and.returnValue(of(Array.from({length: 5}, (x, i) => {
      return {
        assessmentId: i + 1,
        submissionId: i + 2,
        isDone: false,
        name: 'Assessment' + i,
        submitterName: 'Submitter' + i,
        date: utils.timeFormatter('2019-02-01'),
        teamName: '',
        contextId: i + 3
      };
    })));
    fixture.detectChanges();
    component.showDone = true;
    expect(component.noReviewsDone()).toBe(true);
  });

});
