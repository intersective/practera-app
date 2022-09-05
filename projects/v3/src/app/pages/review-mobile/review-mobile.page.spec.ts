import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ActivatedRouteStub } from '@testingv3/activated-route-stub';
import { MockRouter } from '@testingv3/mocked.service';
import { ReviewService } from '@v3/services/review.service';
import { of } from 'rxjs';

import { ReviewMobilePage } from './review-mobile.page';

describe('ReviewMobilePage', () => {
  let component: ReviewMobilePage;
  let fixture: ComponentFixture<ReviewMobilePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewMobilePage ],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: ActivatedRoute,
          useClass: ActivatedRouteStub,
          // useValue: jasmine.createSpyObj('ActivatedRoute', ['queryParams']),
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: ReviewService,
          useValue: jasmine.createSpyObj('ReviewService', {
            'getReviews': of(),
          }, {
            'reviews$': of(),
          }),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewMobilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
