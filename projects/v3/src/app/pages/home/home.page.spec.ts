import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService } from '@v3/services/activity.service';
import { AssessmentService } from '@v3/services/assessment.service';
import { UtilsService } from '@v3/services/utils.service';
import { AlertController, IonicModule } from '@ionic/angular';
import { AchievementService } from '@v3/app/services/achievement.service';
import { HomeService } from '@v3/app/services/home.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { SharedService } from '@v3/app/services/shared.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { FastFeedbackService } from '@v3/app/services/fast-feedback.service';
import { UnlockIndicatorService } from '@v3/app/services/unlock-indicator.service';
import { NavigationStateService } from '@v3/app/services/navigation-state.service';
import { PulsecheckService } from '@v3/app/services/pulsecheck.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { HomePage } from './home.page';
import { of } from 'rxjs';
import { ActivatedRouteStub } from '@testingv3/activated-route-stub';
import { MockRouter } from '@testingv3/mocked.service';
import { TestUtils } from '@testingv3/utils';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let homeService: jasmine.SpyObj<HomeService>;
  let achievementService: jasmine.SpyObj<AchievementService>;
  let sharedService: jasmine.SpyObj<SharedService>;
  let storageService: jasmine.SpyObj<BrowserStorageService>;
  let fastFeedbackService: jasmine.SpyObj<FastFeedbackService>;
  let utilsService: jasmine.SpyObj<UtilsService>;

  beforeEach(waitForAsync(() => {
    const homeServiceSpy = jasmine.createSpyObj('HomeService', {
      'getExperience': undefined,
      'getMilestones': undefined,
      'getProjectProgress': undefined,
      'getPulseCheckStatuses': of({ data: { pulseCheckStatus: {} } }),
      'getPulseCheckSkills': of({ data: { pulseCheckSkills: [] } }),
    }, {
      'experience$': of({ id: 1, name: 'Test Experience', cardUrl: 'test-card-url' }),
      'experienceProgress$': of(0),
      'activityCount$': of(0),
      'milestonesWithProgress$': of([]),
      'milestones$': of([]),
      'projectProgress$': of(0),
    });

    const achievementServiceSpy = jasmine.createSpyObj('AchievementService', [
      'getAchievements',
      'getIsPointsConfigured',
      'getEarnedPoints',
    ], {
      'achievements$': of(),
    });

    const sharedServiceSpy = jasmine.createSpyObj('SharedService', ['refreshJWT']);
    const storageServiceSpy = jasmine.createSpyObj('BrowserStorageService', [
      'get',
      'lastVisited',
      'getUser',
      'getFeature',
    ]);
    // set up default return values for storage service
    storageServiceSpy.getUser.and.returnValue({
      role: 'participant',
      apikey: 'test-key',
      projectId: 1,
      teamId: 1,
    });
    storageServiceSpy.get.and.callFake((key: string) => {
      if (key === 'experience') {
        return { id: 1, name: 'Test Experience', cardUrl: 'test-card-url' };
      }
      return null;
    });
    storageServiceSpy.getFeature.and.returnValue(false);
    const fastFeedbackServiceSpy = jasmine.createSpyObj('FastFeedbackService', {
      'pullFastFeedback': of(null),
    });
    const utilsServiceSpy = jasmine.createSpyObj('UtilsService', ['setPageTitle', 'isMobile']);

    TestBed.configureTestingModule({
      declarations: [ HomePage ],
      imports: [IonicModule.forRoot(), HttpClientTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: new ActivatedRouteStub({}),
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: HomeService,
          useValue: homeServiceSpy
        },
        {
          provide: AchievementService,
          useValue: achievementServiceSpy,
        },
        {
          provide: SharedService,
          useValue: sharedServiceSpy,
        },
        {
          provide: BrowserStorageService,
          useValue: storageServiceSpy,
        },
        {
          provide: FastFeedbackService,
          useValue: fastFeedbackServiceSpy,
        },
        {
          provide: ActivityService,
          useValue: jasmine.createSpyObj('ActivityService', ['clearActivity'])
        },
        {
          provide: AssessmentService,
          useValue: jasmine.createSpyObj('AssessmentService', ['clearAssessment'])
        },
        {
          provide: UtilsService,
          useValue: utilsServiceSpy
        },
        {
          provide: UnlockIndicatorService,
          useValue: jasmine.createSpyObj('UnlockIndicatorService', ['isActivityClearable', 'isMilestoneClearable', 'clearActivity'], {
            'unlockedTasks$': of([])
          })
        },
        {
          provide: NavigationStateService,
          useValue: jasmine.createSpyObj('NavigationStateService', ['getLastActivityState', 'clearLastActivityState'])
        },
        {
          provide: AlertController,
          useValue: jasmine.createSpyObj('AlertController', ['create'])
        },
        {
          provide: PulsecheckService,
          useValue: jasmine.createSpyObj('PulsecheckService', ['getPulsecheckStatuses'])
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', [
            'alert',
            'popUp',
            'getTodoItems',
          ])
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;

    homeService = TestBed.inject(HomeService) as jasmine.SpyObj<HomeService>;
    achievementService = TestBed.inject(AchievementService) as jasmine.SpyObj<AchievementService>;
    sharedService = TestBed.inject(SharedService) as jasmine.SpyObj<SharedService>;
    storageService = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    fastFeedbackService = TestBed.inject(FastFeedbackService) as jasmine.SpyObj<FastFeedbackService>;
    utilsService = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('updateDashboard', () => {
    beforeEach(() => {
      sharedService.refreshJWT.and.returnValue(Promise.resolve());
      storageService.get.and.returnValue({ name: 'Test Experience', cardUrl: 'test-url' });
      storageService.getFeature.and.returnValue(true);
      achievementService.getIsPointsConfigured.and.returnValue(true);
      achievementService.getEarnedPoints.and.returnValue(100);
      homeService.getPulseCheckStatuses.and.returnValue(of({
        success: true,
        status: 'success',
        cache: false,
        data: { pulseCheckStatus: { red: 1, orange: 2, green: 3 } }
      }));
      homeService.getPulseCheckSkills.and.returnValue(of({
        success: true,
        status: 'success',
        cache: false,
        data: { pulseCheckSkills: [{ id: 1, name: 'Skill 1', value: 5 }] }
      }));
      fastFeedbackService.pullFastFeedback.and.returnValue(of({}));
      storageService.lastVisited.and.returnValue([1, 2, 3]);
    });

    it('should refresh JWT token', async () => {
      await component.updateDashboard();
      expect(sharedService.refreshJWT).toHaveBeenCalled();
    });

    it('should get experience from storage', async () => {
      await component.updateDashboard();
      expect(storageService.get).toHaveBeenCalledWith('experience');
      expect(component.experience).toEqual({ name: 'Test Experience', cardUrl: 'test-url' } as any);
    });

    it('should set project hub visibility from feature toggle', async () => {
      await component.updateDashboard();
      expect(storageService.getFeature).toHaveBeenCalledWith('showProjectHub');
      expect(component.showProjectHub).toBe(true);
    });

    it('should hide project hub when feature toggle is disabled', async () => {
      storageService.getFeature.and.returnValue(false);
      await component.updateDashboard();
      expect(component.showProjectHub).toBe(false);
    });

    it('should call service methods to fetch data', async () => {
      await component.updateDashboard();
      expect(homeService.getMilestones).toHaveBeenCalled();
      expect(achievementService.getAchievements).toHaveBeenCalled();
      expect(homeService.getProjectProgress).toHaveBeenCalled();
    });

    it('should get points configuration and earned points', async () => {
      await component.updateDashboard();
      expect(achievementService.getIsPointsConfigured).toHaveBeenCalled();
      expect(achievementService.getEarnedPoints).toHaveBeenCalled();
      expect(component.getIsPointsConfigured).toBe(true);
      expect(component.getEarnedPoints).toBe(100);
    });

    it('should get pulse check statuses when pulse check indicator is enabled', async () => {
      component.pulseCheckIndicatorEnabled = true;
      await component.updateDashboard();
      expect(homeService.getPulseCheckStatuses).toHaveBeenCalled();
      expect(component.pulseCheckStatus).toEqual({ red: 1, orange: 2, green: 3 } as any);
    });

    it('should not get pulse check statuses when pulse check indicator is disabled', async () => {
      component.pulseCheckIndicatorEnabled = false;
      await component.updateDashboard();
      expect(homeService.getPulseCheckStatuses).not.toHaveBeenCalled();
    });

    it('should set page title with experience name', async () => {
      await component.updateDashboard();
      expect(utilsService.setPageTitle).toHaveBeenCalledWith('Test Experience');
    });

    it('should set page title with default when experience has no name', async () => {
      storageService.get.and.returnValue({});
      await component.updateDashboard();
      expect(utilsService.setPageTitle).toHaveBeenCalledWith('Practera');
    });

    it('should set default lead image from experience card URL', async () => {
      await component.updateDashboard();
      expect(component.defaultLeadImage).toBe('test-url');
    });

    it('should set empty default lead image when experience has no card URL', async () => {
      storageService.get.and.returnValue({ name: 'Test Experience' });
      await component.updateDashboard();
      expect(component.defaultLeadImage).toBe('');
    });

    it('should reset and load bookmarks', async () => {
      await component.updateDashboard();
      expect(storageService.lastVisited).toHaveBeenCalledWith('homeBookmarks');
      expect(component.bookmarkedActivities).toEqual({
        1: true,
        2: true,
        3: true
      });
    });

    it('should handle empty bookmarks array', async () => {
      storageService.lastVisited.and.returnValue([]);
      await component.updateDashboard();
      expect(component.bookmarkedActivities).toEqual({});
    });

    it('should handle null bookmarks', async () => {
      storageService.lastVisited.and.returnValue(null);
      await component.updateDashboard();
      expect(component.bookmarkedActivities).toEqual({});
    });

    it('should pull fast feedback', async () => {
      await component.updateDashboard();
      expect(fastFeedbackService.pullFastFeedback).toHaveBeenCalled();
    });

    it('should get pulse check skills', async () => {
      await component.updateDashboard();
      expect(homeService.getPulseCheckSkills).toHaveBeenCalled();
      expect(component.pulseCheckSkills).toEqual([{ id: 1, name: 'Skill 1', value: 5 }]);
    });

    it('should handle null pulse check skills response', async () => {
      homeService.getPulseCheckSkills.and.returnValue(of({
        success: true,
        status: 'success',
        cache: false,
        data: { pulseCheckSkills: null }
      }));
      await component.updateDashboard();
      // component defaults to [] when pulseCheckSkills is null or empty (see line 243: || [])
      // and only updates when newSkills.length > 0, so it stays as initial []
      expect(component.pulseCheckSkills).toEqual([]);
    });

    it('should handle empty pulse check skills response', async () => {
      homeService.getPulseCheckSkills.and.returnValue(of({
        success: true,
        status: 'success',
        cache: false,
        data: { pulseCheckSkills: [] }
      }));
      await component.updateDashboard();
      expect(component.pulseCheckSkills).toEqual([]);
    });
  });

  describe('filterActivities', () => {
    const mockMilestones = [
      {
        id: 1,
        name: 'Milestone 1',
        description: 'First milestone',
        isLocked: false,
        activities: [
          {
            id: 1,
            name: 'Activity 1',
            description: 'First activity about project planning',
            isLocked: false,
            leadImage: '',
            progress: 0.5
          },
          {
            id: 2,
            name: 'Activity 2',
            description: 'Second activity about design',
            isLocked: false,
            leadImage: '',
            progress: 0
          }
        ],
        unlockConditions: []
      },
      {
        id: 2,
        name: 'Milestone 2',
        description: 'Second milestone',
        isLocked: false,
        activities: [
          {
            id: 3,
            name: 'Development Task',
            description: 'Build the application component',
            isLocked: true,
            leadImage: '',
            progress: 0
          }
        ],
        unlockConditions: []
      }
    ];

    beforeEach(() => {
      component.milestones = mockMilestones;
    });

    it('should set filtered milestones to null when milestones are null', () => {
      component.milestones = null;
      component.activitySearchText = 'test';
      component.filterActivities();
      expect(component.filteredMilestones).toBeNull();
    });

    it('should return all milestones when search text is empty', () => {
      component.activitySearchText = '';
      component.filterActivities();
      expect(component.filteredMilestones).toEqual(mockMilestones);
    });

    it('should return all milestones when search text is only whitespace', () => {
      component.activitySearchText = '   ';
      component.filterActivities();
      expect(component.filteredMilestones).toEqual(mockMilestones);
    });

    it('should filter activities by name match (case insensitive)', () => {
      component.activitySearchText = 'activity 1';
      component.filterActivities();

      expect(component.filteredMilestones.length).toBe(1);
      expect(component.filteredMilestones[0].activities.length).toBe(1);
      expect(component.filteredMilestones[0].activities[0].id).toBe(1);
    });

    it('should filter activities by description match (case insensitive)', () => {
      component.activitySearchText = 'planning';
      component.filterActivities();

      expect(component.filteredMilestones.length).toBe(1);
      expect(component.filteredMilestones[0].activities.length).toBe(1);
      expect(component.filteredMilestones[0].activities[0].id).toBe(1);
    });

    it('should filter activities by partial name match', () => {
      component.activitySearchText = 'Activity';
      component.filterActivities();

      expect(component.filteredMilestones.length).toBe(1);
      expect(component.filteredMilestones[0].activities.length).toBe(2);
    });

    it('should filter activities by partial description match', () => {
      component.activitySearchText = 'about';
      component.filterActivities();

      expect(component.filteredMilestones.length).toBe(1);
      expect(component.filteredMilestones[0].activities.length).toBe(2);
    });

    it('should handle search with uppercase text', () => {
      component.activitySearchText = 'DESIGN';
      component.filterActivities();

      expect(component.filteredMilestones.length).toBe(1);
      expect(component.filteredMilestones[0].activities.length).toBe(1);
      expect(component.filteredMilestones[0].activities[0].id).toBe(2);
    });

    it('should filter activities matching either name or description', () => {
      component.activitySearchText = 'development';
      component.filterActivities();

      expect(component.filteredMilestones.length).toBe(1);
      expect(component.filteredMilestones[0].id).toBe(2);
      expect(component.filteredMilestones[0].activities.length).toBe(1);
      expect(component.filteredMilestones[0].activities[0].id).toBe(3);
    });

    it('should return empty milestones array when no activities match', () => {
      component.activitySearchText = 'nonexistent';
      component.filterActivities();

      expect(component.filteredMilestones).toEqual([]);
    });

    it('should only include milestones with matching activities', () => {
      component.activitySearchText = 'first';
      component.filterActivities();

      expect(component.filteredMilestones.length).toBe(1);
      expect(component.filteredMilestones[0].id).toBe(1);
    });

    it('should preserve milestone structure in filtered results', () => {
      component.activitySearchText = 'activity';
      component.filterActivities();

      expect(component.filteredMilestones[0].id).toBeDefined();
      expect(component.filteredMilestones[0].name).toBeDefined();
      expect(component.filteredMilestones[0].activities).toBeDefined();
    });

    it('should handle activities with missing description property', () => {
      const milestonesWithMissingDesc = [{
        id: 1,
        name: 'Milestone',
        description: 'desc',
        isLocked: false,
        activities: [
          {
            id: 1,
            name: 'Activity',
            description: undefined,
            isLocked: false,
            leadImage: ''
          }
        ],
        unlockConditions: []
      }];

      component.milestones = milestonesWithMissingDesc;
      component.activitySearchText = 'activity';
      component.filterActivities();

      expect(component.filteredMilestones.length).toBe(1);
      expect(component.filteredMilestones[0].activities.length).toBe(1);
    });

    it('should handle multiple activities matching same search term', () => {
      component.activitySearchText = 'a';
      component.filterActivities();

      expect(component.filteredMilestones.length).toBe(2);
      expect(component.filteredMilestones[0].activities.length).toBe(2);
      expect(component.filteredMilestones[1].activities.length).toBe(1);
    });

    it('should trim whitespace from search text', () => {
      component.activitySearchText = '  activity 1  ';
      component.filterActivities();

      expect(component.filteredMilestones.length).toBe(1);
      expect(component.filteredMilestones[0].activities.length).toBe(1);
    });
  });

  describe('clearSearch', () => {
    const mockMilestones = [
      {
        id: 1,
        name: 'Milestone 1',
        description: 'First milestone',
        isLocked: false,
        activities: [
          {
            id: 1,
            name: 'Activity 1',
            description: 'First activity',
            isLocked: false,
            leadImage: ''
          }
        ],
        unlockConditions: []
      }
    ];

    beforeEach(() => {
      component.milestones = mockMilestones;
    });

    it('should clear search text', () => {
      component.activitySearchText = 'test search';
      component.clearSearch();

      expect(component.activitySearchText).toBe('');
    });

    it('should reset filtered milestones to all milestones', () => {
      component.activitySearchText = 'test';
      component.filterActivities();
      component.clearSearch();

      expect(component.filteredMilestones).toEqual(mockMilestones);
    });

    it('should call filterActivities when clearing search', () => {
      spyOn(component, 'filterActivities');
      component.clearSearch();

      expect(component.filterActivities).toHaveBeenCalled();
    });
  });

  describe('getFilteredActivityCount', () => {
    it('should return 0 when filtered milestones is null', () => {
      component.filteredMilestones = null;

      expect(component.getFilteredActivityCount()).toBe(0);
    });

    it('should return 0 when there are no filtered milestones', () => {
      component.filteredMilestones = [];

      expect(component.getFilteredActivityCount()).toBe(0);
    });

    it('should return correct count of activities from single milestone', () => {
      component.filteredMilestones = [
        {
          id: 1,
          name: 'Milestone 1',
          description: 'desc',
          isLocked: false,
          activities: [
            { id: 1, name: 'Activity 1', description: 'desc', isLocked: false, leadImage: '' },
            { id: 2, name: 'Activity 2', description: 'desc', isLocked: false, leadImage: '' }
          ],
          unlockConditions: []
        }
      ];

      expect(component.getFilteredActivityCount()).toBe(2);
    });

    it('should return correct count of activities from multiple milestones', () => {
      component.filteredMilestones = [
        {
          id: 1,
          name: 'Milestone 1',
          description: 'desc',
          isLocked: false,
          activities: [
            { id: 1, name: 'Activity 1', description: 'desc', isLocked: false, leadImage: '' },
            { id: 2, name: 'Activity 2', description: 'desc', isLocked: false, leadImage: '' }
          ],
          unlockConditions: []
        },
        {
          id: 2,
          name: 'Milestone 2',
          description: 'desc',
          isLocked: false,
          activities: [
            { id: 3, name: 'Activity 3', description: 'desc', isLocked: false, leadImage: '' }
          ],
          unlockConditions: []
        }
      ];

      expect(component.getFilteredActivityCount()).toBe(3);
    });

    it('should handle milestone with no activities', () => {
      component.filteredMilestones = [
        {
          id: 1,
          name: 'Milestone 1',
          description: 'desc',
          isLocked: false,
          activities: [],
          unlockConditions: []
        }
      ];

      expect(component.getFilteredActivityCount()).toBe(0);
    });

    it('should handle milestone with undefined activities', () => {
      component.filteredMilestones = [
        {
          id: 1,
          name: 'Milestone 1',
          description: 'desc',
          isLocked: false,
          activities: undefined,
          unlockConditions: []
        }
      ];

      expect(component.getFilteredActivityCount()).toBe(0);
    });
  });
});
