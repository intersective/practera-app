import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { AchievementsComponent } from './achievements.component';
import { AchievementsService } from './achievements.service';
import { Observable, of, pipe } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import {
  HttpTestingController,
  HttpClientTestingModule
} from '@angular/common/http/testing';
import { NewRelicService } from '@shared/new-relic/new-relic.service';

class Page {
  get totalPoints() {
    return this.query<HTMLElement>('.points');
  }
  get achievementBadges() {
    return this.queryAll<HTMLElement>('achievement-badge');
  }
  fixture: ComponentFixture<AchievementsComponent>;

  constructor(fixture: ComponentFixture<AchievementsComponent>) {
    this.fixture = fixture;
  }
  //// query helpers ////
  private query<T>(selector: string): T {
    return this.fixture.nativeElement.querySelector(selector);
  }
  private queryAll<T>(selector: string): T[] {
    return this.fixture.nativeElement.querySelectorAll(selector);
  }
}

describe('AchievementsComponent', () => {
  let component: AchievementsComponent;
  let fixture: ComponentFixture<AchievementsComponent>;
  let page: Page;
  let achievementsSpy: jasmine.SpyObj<AchievementsService>;
  let routerSpy: jasmine.SpyObj<Router>;
  const testEvent: NavigationEnd = {
    id: 1,
    url: '/achievements',
    urlAfterRedirects: 'test/test',
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, HttpClientTestingModule],
      declarations: [ AchievementsComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        NewRelicService,
        {
          provide: AchievementsService,
          useValue: jasmine.createSpyObj('AchievementsService', [
            'getAchievements',
            'getIsPointsConfigured',
            'getEarnedPoints'
          ])
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
            events: of(new NavigationEnd(testEvent.id, testEvent.url, testEvent.urlAfterRedirects)),
          },
        }
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AchievementsComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    achievementsSpy = TestBed.inject(AchievementsService) as jasmine.SpyObj<AchievementsService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  const mockAchievements = [
    {
      id: 1,
      name: 'achieve 1',
      description: 'des'
    },
    {
      id: 2,
      name: 'achieve 2',
      description: 'des'
    },
    {
      id: 3,
      name: 'achieve 3',
      description: 'des'
    }
  ];
  beforeEach(() => {
    achievementsSpy.getAchievements.and.returnValue(of(mockAchievements));
    achievementsSpy.getIsPointsConfigured.and.returnValue(true);
    achievementsSpy.getEarnedPoints.and.returnValue(100);
    component.routeUrl = '/achievements';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when testing onEnter()', () => {
    it(`should run AchievementComponent's onEnter() method`, () => {
      spyOn(component, 'onEnter');
      component.ngOnInit(); // inherited from RouterEnterService
      expect(component.onEnter).toHaveBeenCalledTimes(1);
    });

    it(`should get correct achievements`, fakeAsync(() => {
      spyOn(component.storage, 'get').and.returnValue({});
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.loadingAchievements).toBe(false);
        expect(achievementsSpy.getAchievements.calls.count()).toBe(1);
        expect(component.achievements).toEqual(mockAchievements);
      });
    }));
  });

  describe('when testing back()', () => {
    it(`should navigate to the correct page`, () => {
      component.back();
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['app', 'home']);
    });
  });

});

