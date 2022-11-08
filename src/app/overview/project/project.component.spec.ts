import { CUSTOM_ELEMENTS_SCHEMA, ElementRef, QueryList } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectComponent } from './project.component';
import { ProjectService } from './project.service';
import { Observable, of, pipe } from 'rxjs';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { UtilsService } from '@services/utils.service';
import { HomeService } from '../home/home.service';
import { TestUtils } from '@testing/utils';
import { DOCUMENT } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FastFeedbackService } from '../../fast-feedback/fast-feedback.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { MockRouter } from '@testing/mocked.service';
import { Apollo } from 'apollo-angular';
import { BrowserStorageService } from '@services/storage.service';

export class MockElementRef extends ElementRef {
  constructor() { super(null); }
}

class Page {
  get programName() {
    return this.query<HTMLElement>('ion-title');
  }
  get topBubbles() {
    return this.queryAll<HTMLElement>('bubbles-top');
  }
  get milestones() {
    return this.queryAll<HTMLElement>('project-item');
  }
  fixture: ComponentFixture<ProjectComponent>;

  constructor(fixture: ComponentFixture<ProjectComponent>) {
    this.fixture = fixture;
  }
  private query<T>(selector: string): T {
    return this.fixture.nativeElement.querySelector(selector);
  }
  private queryAll<T>(selector: string): T[] {
    return this.fixture.nativeElement.querySelectorAll(selector);
  }
}

class MockDocument {}

describe('ProjectComponent', () => {
  let component: ProjectComponent;
  let fixture: ComponentFixture<ProjectComponent>;
  let page: Page;
  let projectSpy: jasmine.SpyObj<ProjectService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeSpy: ActivatedRoute;
  let utils: UtilsService;
  let homeSpy: jasmine.SpyObj<HomeService>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      declarations: [ ProjectComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        Apollo,
        UtilsService,
        NewRelicService,
        {
          provide: ElementRef,
          useClass: MockElementRef
        },
        {
          provide: ProjectService,
          useValue: jasmine.createSpyObj('ProjectService', ['getProject'])
        },
        {
          provide: HomeService,
          useValue: jasmine.createSpyObj('HomeService', ['getProgramName'])
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ activityId: 1 })
            },
            queryParamMap: of(convertToParamMap({ activityId: 1 }))
          }
        },
        {
          provide: Document,
          useClass: MockDocument
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['get', 'getUser'])
        }
      ],
    })
    .compileComponents();
  }));

  const milestones = Array.from({length: 5}, (x, i) => {
    return {
      id: i + 1,
      name: 'm' + i,
      description: 'des' + i,
      isLocked: false,
      Activity: Array.from({length: 3}, (y, j) => {
        return {
          id: i * 10 + j + 1,
          name: 'activity name' + j,
          isLocked: false,
          leadImage: '',
        };
      })
    };
  });

  const milestoneProgressLocal = Array.from({length: 5}, (x, i) => {
    return {
      id: i + 1,
      progress: 0.27,
      activities: Array.from({length: 3}, (y, j) => {
        return {
          id: i * 10 + j + 1,
          progress: 0.45,
        };
      })
    };
  });

  const milestoneProgress = Array.from({length: 5}, (x, i) => {
    return {
      id: i + 1,
      progress: 0.13,
      activities: Array.from({length: 3}, (y, j) => {
        return {
          id: i * 10 + j + 1,
          progress: 0.55,
        };
      })
    };
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    projectSpy = TestBed.inject(ProjectService) as jasmine.SpyObj<ProjectService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    routeSpy = TestBed.inject(ActivatedRoute);
    utils = TestBed.inject(UtilsService);
    homeSpy = TestBed.inject(HomeService) as jasmine.SpyObj<HomeService>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    // homeSpy.getProgramName.and.returnValue(of('program name'));
    projectSpy.getProject.and.returnValue(of(milestones));
    component.refresh = of(true);
    storageSpy.get.and.returnValue({
      project: {
        progress: 0.10,
        milestones: milestoneProgressLocal
      }
    });
    storageSpy.getUser.and.returnValue({
      truncateDescription: true,
      activityCompleteMessage: null
    });
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('when testing onEnter(), should get correct data', () => {
    fixture.detectChanges();
    component.onEnter();
    expect(component.loadingMilestone).toBe(false);
    expect(component.milestones).toEqual(milestones);
  });

  it('when testing scrollTo(), should get correct activeMilestoneIndex', () => {
    fixture.detectChanges();
    component.scrollTo('milestone-2', 1);
    expect(component.activeMilestoneIndex).toEqual(1);
  });

  it('when testing goToActivity(), should navigate to the correct page', () => {
    component.goToActivity(1);
    expect(routerSpy.navigate.calls.first().args[0]).toEqual(['app', 'activity', 1]);
  });

  it('when testing updateProgress(), should load data from local stroage if no data pass to', () => {
    component.milestones = milestones;
    component.updateProgress();
    expect(component.milestones[0].progress).toEqual(0.27);
    expect(component.milestones[0].Activity[0].progress).toEqual(0.45);
  });

  it('when testing updateProgress(), should load data from pass data if data pass to', () => {
    component.milestones = milestones;
    component.updateProgress({
      project: {
        progress: 0.10,
        milestones: milestoneProgress
      }
    });
    expect(component.milestones[0].progress).toEqual(0.13);
    expect(component.milestones[0].Activity[0].progress).toEqual(0.55);
  });
});

