import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { AssessmentService } from '@v3/services/assessment.service';
import { UtilsService } from '@v3/services/utils.service';
import { IonicModule } from '@ionic/angular';
import { ActivatedRouteStub } from '@testingv3/activated-route-stub';
import { TestUtils } from '@testingv3/utils';
import { ReviewService } from '@v3/app/services/review.service';
import { of } from 'rxjs';

import { ReviewDesktopPage } from './review-desktop.page';

describe('ReviewDesktopPage', () => {
  let component: ReviewDesktopPage;
  let fixture: ComponentFixture<ReviewDesktopPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewDesktopPage ],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: UtilsService,
          useClass: TestUtils
        },
        {
          provide: ActivatedRoute,
          useValue: new ActivatedRouteStub({ submissionId: 1}),
        },
        {
          provide: AssessmentService,
          useValue: jasmine.createSpyObj('AssessmentService', ['saveAnswers'], {
            'assessment$': of(true),
            'submission$': of(true),
            'review$': of(true),
          }),
        },
        {
          provide: ReviewService,
          useValue: jasmine.createSpyObj('ReviewService', ['getReviews'], {
            reviews$: of(true),
          }),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewDesktopPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
