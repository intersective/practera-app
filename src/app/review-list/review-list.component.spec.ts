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
    serviceSpy = TestBed.get(ReviewListService);
    routerSpy = TestBed.get(Router);
    utils = TestBed.get(UtilsService);
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
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.reviews).toEqual(reviews);
      expect(component.showDone).toBe(false);
      expect(component.loadingReviews).toBe(false);
    });
  });

  it('should navigate to the correct page gotoReview()', () => {
    component.gotoReview(1, 2, 3);
    expect(routerSpy.navigate.calls.first().args[0]).toEqual(['assessment', 'review', 1, 2, 3, {from: 'reviews'}]);
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
