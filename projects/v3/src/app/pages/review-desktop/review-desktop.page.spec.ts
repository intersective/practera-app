import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { AssessmentService } from '@app/assessment/assessment.service';
import { UtilsService } from '@app/services/utils.service';
import { IonicModule } from '@ionic/angular';
import { ReviewService } from '@v3/app/services/review.service';

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
          useValue: jasmine.createSpyObj('UtilsService', []),
        },
        {
          provide: ActivatedRoute,
          useValue: jasmine.createSpyObj('ActivatedRoute', []),
        },
        {
          provide: AssessmentService,
          useValue: jasmine.createSpyObj('AssessmentService', []),
        },
        {
          provide: ReviewService,
          useValue: jasmine.createSpyObj('ReviewService', []),
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
