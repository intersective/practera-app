import { TestBed } from '@angular/core/testing';
import { AchievementService } from './achievement.service';
import { of } from 'rxjs';
import { RequestService } from 'request';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { TestUtils } from '@testingv3/utils';
import { ApolloService } from './apollo.service';
import { DemoService } from './demo.service';

describe('AchievementService', () => {
  let service: AchievementService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let apolloSpy: jasmine.SpyObj<ApolloService>;

  beforeEach(() => {
    apolloSpy = jasmine.createSpyObj('ApolloService', ['graphQLFetch', 'graphQLWatch']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        AchievementService,
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['get', 'post', 'apiResponseFormatError'])
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            getUser: {
              projectId: 1
            }
          })
        },
        {
          provide: ApolloService,
          useValue: apolloSpy,
        },
        {
          provide: DemoService,
          useValue: jasmine.createSpyObj('DemoService', ['normalResponse'])
        }
      ]
    });
    service = TestBed.inject(AchievementService) as jasmine.SpyObj<AchievementService>;
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when testing getAchievements()', () => {
    // graphql response format - achievements are in data.achievements
    const graphqlResponse = {
      data: {
        achievements: [
          {
            id: 1,
            name: 'achieve 1',
            description: 'des',
            badge: '',
            type: 'achievement',
            points: 100,
            isEarned: true,
            earnedDate: '2019-02-02'
          },
          {
            id: 2,
            name: 'achieve 2',
            description: 'des',
            badge: '',
            type: 'achievement',
            points: 200,
            isEarned: false,
            earnedDate: '2019-02-02'
          },
          {
            id: 3,
            name: 'achieve 3',
            description: 'des',
            badge: '',
            type: 'achievement',
            points: 300,
            isEarned: true,
            earnedDate: '2019-02-02'
          },
          {
            id: 4,
            name: 'achieve 4',
            description: 'des',
            badge: '',
            type: 'achievement',
            points: 0,
            isEarned: true,
            earnedDate: '2019-02-02'
          }
        ]
      }
    };
    const expected = JSON.parse(JSON.stringify(graphqlResponse.data.achievements)).map(res => {
      return {
        id: res.id,
        name: res.name,
        description: res.description,
        image: res.badge,
        points: res.points,
        isEarned: res.isEarned,
        earnedDate: res.earnedDate,
        type: res.type,
        badge: res.badge
      };
    });

    describe('should throw error', () => {
      let tmpAchievements;
      let errMsg;
      beforeEach(() => {
        tmpAchievements = JSON.parse(JSON.stringify(graphqlResponse.data.achievements));
      });
      afterEach(() => {
        apolloSpy.graphQLFetch.and.returnValue(of({ data: { achievements: tmpAchievements } }));
        service.getAchievements();
        service.achievements$.subscribe();
        expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
        expect(requestSpy.apiResponseFormatError.calls.first().args[0]).toEqual(errMsg);
      });
      it('Achievement format error', () => {
        tmpAchievements = {}; // not an array
        errMsg = 'Achievement format error';
      });
      it('Achievement object format error', () => {
        tmpAchievements[0] = {}; // missing required fields
        errMsg = 'Achievement object format error';
      });
    });

    it('should get the correct data', () => {
      apolloSpy.graphQLFetch.and.returnValue(of(graphqlResponse));
      service.getAchievements();
      service.achievements$.subscribe(res => {
        expect(res).toEqual(expected);
      });
      expect(service.earnedPoints).toBe(400);
      expect(service.isPointsConfigured).toBe(true);
    });
  });

  describe('graphQLGetAchievements', () => {
    it('should return an array of achievements', (done) => {
      const mockResponse = {
        data: {
          achievements: [
            {
              id: 1,
              name: 'Achievement 1',
              description: 'Description 1',
              type: 'type1',
              badge: 'badge1',
              openBadge: 'openBadge1',
              points: 10,
              isEarned: true,
              earnedDate: '2021-01-01',
              progress: 50,
              active: true,
              certificateUrl: 'url1'
            },
            {
              id: 2,
              name: 'Achievement 2',
              description: 'Description 2',
              type: 'type2',
              badge: 'badge2',
              openBadge: 'openBadge2',
              points: 20,
              isEarned: false,
              earnedDate: '2021-02-01',
              progress: 75,
              active: false,
              certificateUrl: 'url2'
            }
          ]
        }
      };

      // reset the spy for this describe block
      apolloSpy.graphQLFetch.calls.reset();
      apolloSpy.graphQLFetch.and.returnValue(of(mockResponse));

      service.graphQLGetAchievements().subscribe((achievements) => {
        expect(achievements.length).toBe(2);
        expect(achievements).toEqual(mockResponse.data.achievements);
        done();
      });
    });

    it('should return an empty array if no badges are returned', (done) => {
      const mockResponse = {
        data: {
          achievements: []
        }
      };

      apolloSpy.graphQLFetch.calls.reset();
      apolloSpy.graphQLFetch.and.returnValue(of(mockResponse));

      service.graphQLGetAchievements().subscribe((achievements) => {
        expect(achievements.length).toBe(0);
        expect(achievements).toEqual([]);
        done();
      });
    });

    it('should handle errors gracefully', (done) => {
      apolloSpy.graphQLFetch.calls.reset();
      apolloSpy.graphQLFetch.and.returnValue(of({ data: null }));

      service.graphQLGetAchievements().subscribe((achievements) => {
        expect(achievements.length).toBe(0);
        expect(achievements).toEqual([]);
        done();
      });
    });
  });
});
