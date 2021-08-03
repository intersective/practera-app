import { async, ComponentFixture, TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { SwitcherService } from './switcher.service';
import { of, Observable, pipe } from 'rxjs';
import { RequestService } from '@shared/request/request.service';
import { SharedService } from '@services/shared.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { TestUtils } from '@testing/utils';
import { BrowserStorageServiceMock } from '@testing/mocked.service';
import { BrowserStorageService } from '@services/storage.service';
import { EventListService } from '@app/event-list/event-list.service';
import { ReviewListService } from '@app/review-list/review-list.service';
import { environment } from '@environments/environment';
import { ProgramFixture } from '@testing/fixtures/programs';
import { PusherService } from '@shared/pusher/pusher.service';

describe('SwitcherService', () => {
  let service: SwitcherService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let eventSpy: jasmine.SpyObj<EventListService>;
  let reviewSpy: jasmine.SpyObj<ReviewListService>;
  let pusherSpy: jasmine.SpyObj<PusherService>;
  let sharedSpy: jasmine.SpyObj<SharedService>;
  let utils: UtilsService;
  const testUtils = new TestUtils();

  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [ HttpClientTestingModule ],
        providers: [
          SwitcherService,
          EventListService,
          ReviewListService,
          PusherService,
          {
            provide: SharedService,
            useValue: jasmine.createSpyObj('SharedService', ['onPageLoad', 'initWebServices']),
          },
          {
            provide: UtilsService,
            useClass: TestUtils,
          },
          {
            provide: BrowserStorageService,
            useClass: BrowserStorageServiceMock
          },
          {
            provide: RequestService,
            useValue: jasmine.createSpyObj('RequestService', ['post', 'graphQLQuery', 'apiResponseFormatError'])
          },
          {
            provide: NotificationService,
            useValue: jasmine.createSpyObj('NotificationService', ['modal'])
          },
        ]
    });
    service = TestBed.inject(SwitcherService);
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
    utils = TestBed.inject(UtilsService);
    notificationSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    eventSpy = TestBed.inject(EventListService) as jasmine.SpyObj<EventListService>;
    reviewSpy = TestBed.inject(ReviewListService) as jasmine.SpyObj<ReviewListService>;
    pusherSpy = TestBed.inject(PusherService) as jasmine.SpyObj<PusherService>;
    sharedSpy = TestBed.inject(SharedService) as jasmine.SpyObj<SharedService>;

    requestSpy.get = jasmine.createSpy('get').and.returnValue(new Observable());
  });

  it('should be created', () => {
      expect(service).toBeTruthy();
  });

  const mockStacks = [
    {
      uuid: '0001',
      name: 'Practera Classic App - Sandbox',
      description: 'Participate in an experience as a learner or reviewer - Testing',
      image: 'https://asd/img/learners_reviewers.png',
      url: 'https://app.sandbox.practera.com',
      type: 'app',
      coreApi: 'https://admin.sandbox.practera.com',
      coreGraphQLApi: 'https://core-graphql-api.sandbox.practera.com',
      chatApi: 'https://chat-api.sandbox.practera.com',
      filestack: {
        s3Config: {
          container: 'files.sandbox.practera.com',
          region: 'ap-southeast-2'
        },
      },
      defaultCountryModel: 'AUS',
      lastLogin: 1619660600368
    },
    {
      uuid: '002',
      name: 'Practera App - Local Development',
      description: 'Participate in an experience as a learner or reviewer - Local',
      image: 'https://media.intersective.com/img/learners_reviewers.png',
      url: 'http://127.0.0.1:4200/',
      type: 'app',
      coreApi: 'http://127.0.0.1:8080',
      coreGraphQLApi: 'http://127.0.0.1:8000',
      chatApi: 'http://localhost:3000/local/graphql',
      filestack: {
        s3Config: {
          container: 'practera-aus',
          region: 'ap-southeast-2'
        },
      },
      defaultCountryModel: 'AUS',
      lastLogin: 1619660600368
    }
  ];

  describe('getExperience()', () => {
    it('should call each stack and get return peograms', fakeAsync(() => {
      requestSpy.post.and.returnValue(of({
        success: true,
        data: {
          tutorial: null,
          apikey: '123456',
          Timelines: [
            {
              Program: {
                config: {
                  theme_color: 'abc'
                }
              },
              Enrolment: {
                created: '2020-01-05'
              },
              Project: {
                lead_image: 'https://www.filepicker.io/api/file/DAsMaIUcQcSM3IFqalPN'
              },
              Timeline: {}
            },
            {
              Program: {
                config: {
                  theme_color: 'xzs'
                }
              },
              Enrolment: {
                created: '2021-01-05'
              },
              Project: {
                lead_image: 'https://www.filepicker.io/api/file/DAsMaIUcQcSM3IFqalPN'
              },
              Timeline: {}
            }
          ]
        }
      }));
      storageSpy.loginApiKey = '456812';
      service.getPrograms(mockStacks).subscribe(programs => {
        expect(programs[0].project.lead_image).toContain('https://cdn.filestackcontent.com/resize=fit:crop,width:');
        expect(programs[0].stack).not.toBeNull();
        expect(programs[0].apikey).toContain('123456');
      });
    }));

    it(`should not call method or run code if timeline didn't have programs `, fakeAsync(() => {
      spyOn(service, 'getLeadImage');
      requestSpy.post.and.returnValue(of({
        success: true,
        data: {
          tutorial: null,
          apikey: '123456',
          Timelines: []
        }
      }));
      storageSpy.loginApiKey = '456812';
      service.getPrograms(mockStacks);
      tick();
      expect(service.getLeadImage).not.toHaveBeenCalled();
    }));
  });

  describe('when testing getLeadImage()', () => {
    it(`should null if project didn't have lead image `, () => {
        expect(service.getLeadImage({})).toBe(null);
    });
    it('should URL if project have lead image ', () => {
      const imageUrl = service.getLeadImage({lead_image: 'https://www.filepicker.io/api/file/DAsMaIUcQcSM3IFqalPN'});
      expect(imageUrl).toContain('https://cdn.filestackcontent.com/resize=fit:crop,width:');
    });
    it('should return resized image url for mobile ', () => {
      utils.isMobile = jasmine.createSpy('isMobile').and.returnValues(true);
      const imageUrl = service.getLeadImage({lead_image: 'https://www.filepicker.io/api/file/DAsMaIUcQcSM3IFqalPN'});
      expect(imageUrl).toContain('width:600');
    });
    it('should return resized image url for web ', () => {
      utils.isMobile = jasmine.createSpy('isMobile').and.returnValues(false);
      const imageUrl = service.getLeadImage({lead_image: 'https://www.filepicker.io/api/file/DAsMaIUcQcSM3IFqalPN'});
      expect(imageUrl).toContain('width:1024');
    });
  });

  describe('when testing checkIsOneProgram()', () => {
    it('should return true if got Array with one program object ', () => {
        spyOn(utils, 'isEmpty').and.returnValue(false);
        expect(service.checkIsOneProgram([{}])).toBe(true);
    });
    it('should return false if got Array multiple program objects ', () => {
        spyOn(utils, 'isEmpty').and.returnValue(false);
        expect(service.checkIsOneProgram([{}, {}, {}])).toBe(false);
    });
    it('should get cached program when programs params is empty', () => {
      const SAMPLE = [{}];
      spyOn(utils, 'isEmpty').and.returnValue(true);
      storageSpy.get = jasmine.createSpy('storageSpy.get').and.returnValue(SAMPLE);
      expect(service.checkIsOneProgram(SAMPLE)).toBe(true);
      expect(storageSpy.get).toHaveBeenCalledWith('programs');
    });
  });

  describe('when testing switchProgramAndNavigate()', () => {
    beforeEach(() => {
      spyOn(pusherSpy, 'initialise');
      // by default test normal flow (non-direct link)
      storageSpy.get = jasmine.createSpy('get').and.returnValue(false);
    });

    it('should return undefined if got empty object ', fakeAsync(() => {
      let result;
      spyOn(utils, 'isEmpty').and.returnValue(true);
      service.switchProgramAndNavigate({}).then(data => {
        result = data;
      });
      flushMicrotasks();
      expect(result).toBeUndefined();
    }));

    it('should return [switcher] if programs is Array with multiple program objects ', fakeAsync(() => {
        let result;
        spyOn(service, 'checkIsOneProgram').and.returnValue(false);
        spyOn(Array, 'isArray').and.returnValue(true);
        service.switchProgramAndNavigate(ProgramFixture).then(data => {
          result = data;
        });
        flushMicrotasks();
        expect(result).toEqual(['switcher', 'switcher-program']);
    }));

    it('should return [app, home] if programs is Array with multiple program objects', fakeAsync(() => {
      environment.goMobile = false;
      const [firstProgram] = ProgramFixture;
      spyOn(service, 'checkIsOneProgram').and.returnValue(true);
      spyOn(Array, 'isArray').and.returnValue(true);
      spyOn(service, 'switchProgram').and.returnValue({
        toPromise: () => new Promise(res => res(true))
      });

      let result;
      service.switchProgramAndNavigate([firstProgram]).then(data => {
        result = data;
      });
      flushMicrotasks();
      expect(result).toEqual(['app', 'home']);
      expect(pusherSpy.initialise).toHaveBeenCalled();
    }));

    it('should return [app, home] if programs is not an Array and got one program object (direct link)', fakeAsync(() => {
        spyOn(utils, 'isEmpty').and.returnValue(false);
        spyOn(Array, 'isArray').and.returnValue(false);
        spyOn(service, 'switchProgram').and.returnValue(of({}));

        // simulate direct-link
        storageSpy.get = jasmine.createSpy('get').and.returnValue(true);
        environment.goMobile = false;

        let result;
        service.switchProgramAndNavigate(ProgramFixture[0]).then(data => {
          result = data;
        });
        flushMicrotasks();
        expect(storageSpy.get).toHaveBeenCalledWith('directLinkRoute');
        expect(storageSpy.remove).toHaveBeenCalledWith('directLinkRoute');
        expect(result).toEqual(true);
    }));

    it('should return [app, home] if programs is not an Array and got one program object (not direct link)', fakeAsync(() => {
        spyOn(utils, 'isEmpty').and.returnValue(false);
        spyOn(Array, 'isArray').and.returnValue(false);
        spyOn(service, 'switchProgram').and.returnValue(of({}));

        // disable direct-link
        storageSpy.get = jasmine.createSpy('get').and.returnValue(false);
        environment.goMobile = false;

        let result;
        service.switchProgramAndNavigate({}).then(data => {
          result = data;
        });
        flushMicrotasks();
        expect(storageSpy.get).toHaveBeenCalledWith('directLinkRoute');
        expect(storageSpy.remove).not.toHaveBeenCalledWith('directLinkRoute');
        expect(result).toEqual(['app', 'home']);
    }));
  });

  it('getProgresses should return correct value', () => {
    requestSpy.graphQLQuery.and.returnValue(of({
      data: {
        projects: [
          {
            id: 1,
            progress: 0.1,
            todoItems: [
              {
                isDone: true
              },
              {
                isDone: false
              },
              {
                isDone: true
              }
            ]
          },
          {
            id: 2,
            progress: 0.31,
            todoItems: [
              {
                isDone: true
              },
              {
                isDone: false
              },
              {
                isDone: false
              }
            ]
          }
        ]
      }
    }));
    service.getProgresses([1, 2]).subscribe(res => {
      expect(res).toEqual([
        {
          id: 1,
          progress: 0.1,
          todoItems: 1
        },
        {
          id: 2,
          progress: 0.31,
          todoItems: 2
        }
      ]);
    });
  });

  describe('switchProgram()', () => {
    beforeEach(() => {
      spyOn(service, 'getNewJwt').and.returnValue(of());
      spyOn(service, 'getTeamInfo').and.returnValue(of());
      spyOn(service, 'getMyInfo').and.returnValue(of());
      spyOn(service, 'getReviews').and.returnValue(of());
      spyOn(service, 'getEvents').and.returnValue(of());
    });

    it('should collect related data based on selected program', () => {
      service.switchProgram(ProgramFixture[0]).subscribe();
      expect(storageSpy.setUser).toHaveBeenCalled();
      expect(sharedSpy.onPageLoad).toHaveBeenCalled();
      expect(service.getNewJwt).toHaveBeenCalled();
      expect(service.getTeamInfo).toHaveBeenCalled();
      expect(service.getMyInfo).toHaveBeenCalled();
      expect(service.getReviews).toHaveBeenCalled();
      expect(service.getEvents).toHaveBeenCalled();
    });

    it('should set the correct user data (1)', () => {
      const programObj = ProgramFixture[3];
      delete programObj.program.config.theme_color;
      service.switchProgram(programObj).subscribe();
      expect(storageSpy.setUser).toHaveBeenCalledWith({
        programId: ProgramFixture[3].program.id,
        programName: ProgramFixture[3].program.name,
        programImage: ProgramFixture[3].project.lead_image,
        hasReviewRating: false,
        truncateDescription: true,
        experienceId: ProgramFixture[3].program.experience_id,
        projectId: ProgramFixture[3].project.id,
        timelineId: ProgramFixture[3].timeline.id,
        contactNumber: ProgramFixture[3].enrolment.contact_number,
        colors: {
          theme: undefined,
          primary: undefined,
          secondary: undefined,
        },
        activityCardImage: '',
        enrolment: ProgramFixture[3].enrolment,
        activityCompleteMessage: null,
        chatEnabled: true,
        teamId: null,
        hasEvents: false,
        hasReviews: false
      });
    });

    it('should set the correct user data (2)', () => {
      const programObj = ProgramFixture[2];
      programObj.program.config = {
        theme_color: 'none',
        card_style: 'style',
        review_rating: true,
        truncate_description: false,
      };
      programObj.experience.config = {
        activity_complete_message: 'completed',
        chat_enable: false,
      };
      service.switchProgram(programObj).subscribe();
      expect(storageSpy.setUser).toHaveBeenCalledWith({
        programId: ProgramFixture[2].program.id,
        programName: ProgramFixture[2].program.name,
        programImage: ProgramFixture[2].project.lead_image,
        hasReviewRating: true,
        truncateDescription: false,
        experienceId: ProgramFixture[2].program.experience_id,
        projectId: ProgramFixture[2].project.id,
        timelineId: ProgramFixture[2].timeline.id,
        contactNumber: ProgramFixture[2].enrolment.contact_number,
        colors: {
          theme: 'none',
          primary: undefined,
          secondary: undefined,
        },
        activityCardImage: '/assets/style',
        enrolment: ProgramFixture[2].enrolment,
        activityCompleteMessage: 'completed',
        chatEnabled: false,
        teamId: null,
        hasEvents: false,
        hasReviews: false
      });
    });
  });

  describe('getTeamInfo()', () => {
    it('should make API request to `api/teams.json`', () => {
      requestSpy.get.and.returnValue(of({
        success: true,
        data: {
          Teams: [
            { id: 1 }
          ]
        }
      }));

      service.getTeamInfo().subscribe();
      expect(requestSpy.get).toHaveBeenCalledWith('api/teams.json');
    });
  });

  describe('getMyInfo()', () => {
    it('should make API request to `api/users.json`', () => {
      requestSpy.get.and.returnValue(of({
        data: {
          User: {
            name: 'name',
            contactNumber: 'contact_number',
            email: 'email',
            role: 'role',
            image: 'image',
            linkedinConnected: 'linkedinConnected',
            linkedinUrl: 'linkedin_url',
            userHash: 'userhash',
          }
        }
      }));

      service.getMyInfo().subscribe(res => {
        expect(requestSpy.get).toHaveBeenCalledWith('api/users.json');
      });
    });
  });

  describe('getReviews()', () => {
    it('should get events from API and store in browser cache', () => {
      spyOn(reviewSpy, 'getReviews').and.returnValue(new Observable());
      service.getReviews().subscribe(() => {
        expect(reviewSpy.getReviews).toHaveBeenCalled();
        expect(storageSpy.setUser).toHaveBeenCalled();
      });
    });
  });

  describe('getEvents()', () => {
    it('should get events from API and store in browser cache', () => {
      spyOn(eventSpy, 'getEvents').and.returnValue(new Observable());
      service.getEvents().subscribe(() => {
        expect(eventSpy.getEvents).toHaveBeenCalled();
        expect(storageSpy.setUser).toHaveBeenCalled();
      });
    });
  });

  describe('getNewJwt()', () => {
    it('should make api request to `api/v2/users/jwt/refresh.json`', () => {
      service.getNewJwt().subscribe(() => {
        expect(requestSpy.get).toHaveBeenCalledWith('api/v2/users/jwt/refresh.json');
      });
    });
  });
});
