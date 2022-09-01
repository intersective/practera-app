import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ReviewService } from '@v3/app/services/review.service';
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
          useValue: jasmine.createSpyObj('ActivatedRoute', ['queryParams']),
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['navigate']),
        },
        {
          provide: ReviewService,
          useValue: jasmine.createSpyObj('ReviewService', {
            'reviews$': of(),
            'getReviews': of(),
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
