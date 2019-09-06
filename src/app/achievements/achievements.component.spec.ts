import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AchievementsComponent } from './achievements.component';
import { AchievementsService } from './achievements.service';
import { Observable, of, pipe } from 'rxjs';
import { Router } from '@angular/router';
import { SharedModule } from '@shared/shared.module';

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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [ AchievementsComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        {
          provide: AchievementsService,
          useValue: jasmine.createSpyObj('AchievementsService', ['getAchievements', 'getIsPointsConfigured', 'getEarnedPoints'])
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
            events: of()
          }
        }
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AchievementsComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    achievementsSpy = TestBed.get(AchievementsService);
    routerSpy = TestBed.get(Router);
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
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  describe('when testing onEnter()', () => {
    it(`should get correct achievements`, () => {
      fixture.detectChanges();
      expect(component.loadingAchievements).toBe(false);
      expect(achievementsSpy.getAchievements.calls.count()).toBe(1);
      expect(component.achievements).toEqual(mockAchievements);
    });
  });

  describe('when testing back()', () => {
    it(`should navigate to the correct page`, () => {
      component.back();
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['app', 'home']);
    });
  });

});

