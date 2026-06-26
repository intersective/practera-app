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

  describe('getBadges()', () => {
    const mockBadgesResponse = {
      data: {
        badges: [
          {
            id: 10,
            name: 'Badge One',
            description: '<p>Desc</p>',
            type: 'badge',
            badge: 'https://cdn/badge1.png',
            openBadge: 'https://cdn/openbadge1.png',
            points: 50,
            isEarned: true,
            earnedDate: '2024-01-15',
            progress: 1,
            active: true,
            certificateUrl: 'https://s3/cert1.pdf',
          },
          {
            id: 11,
            name: 'Super Badge One',
            description: '<p>Super desc</p>',
            type: 'superbadge',
            badge: 'https://cdn/superbadge1.png',
            openBadge: null,
            points: 200,
            isEarned: true,
            earnedDate: '2024-03-01',
            progress: 1,
            active: true,
            certificateUrl: null,
          },
        ],
      },
    };

    it('should return badges from the badges query', (done) => {
      apolloSpy.graphQLFetch.and.returnValue(of(mockBadgesResponse));

      service.getBadges().subscribe((badges) => {
        expect(badges.length).toBe(2);
        expect(badges[0].id).toBe(10);
        expect(badges[0].type).toBe('badge');
        expect(badges[1].type).toBe('superbadge');
        done();
      });
    });

    it('should call graphQLFetch with the badges query', () => {
      apolloSpy.graphQLFetch.and.returnValue(of(mockBadgesResponse));

      service.getBadges().subscribe();

      expect(apolloSpy.graphQLFetch).toHaveBeenCalledWith(
        jasmine.stringContaining('badges')
      );
    });

    it('should return empty array when badges data is null', (done) => {
      apolloSpy.graphQLFetch.and.returnValue(of({ data: { badges: null } }));

      service.getBadges().subscribe((badges) => {
        expect(badges).toEqual([]);
        done();
      });
    });

    it('should return empty array when data is missing', (done) => {
      apolloSpy.graphQLFetch.and.returnValue(of({ data: null }));

      service.getBadges().subscribe((badges) => {
        expect(badges).toEqual([]);
        done();
      });
    });
  });

  describe('getCertificateUrl()', () => {
    it('should return certificate URL from graphql', (done) => {
      const pdfUrl = 'https://s3/presigned/cert.pdf';
      apolloSpy.graphQLFetch.and.returnValue(
        of({ data: { certificateUrl: pdfUrl } })
      );

      service.getCertificateUrl(42).subscribe((url) => {
        expect(url).toBe(pdfUrl);
        done();
      });
    });

    it('should pass userName variable when provided', () => {
      apolloSpy.graphQLFetch.and.returnValue(
        of({ data: { certificateUrl: 'https://s3/cert.pdf' } })
      );

      service.getCertificateUrl(42, 'Jane Doe').subscribe();

      const callArgs = apolloSpy.graphQLFetch.calls.mostRecent().args;
      expect(callArgs[1]).toEqual(
        jasmine.objectContaining({
          variables: jasmine.objectContaining({ achievementId: 42, userName: 'Jane Doe' }),
        })
      );
    });

    it('should not include userName when not provided', () => {
      apolloSpy.graphQLFetch.and.returnValue(
        of({ data: { certificateUrl: null } })
      );

      service.getCertificateUrl(99).subscribe();

      const callArgs = apolloSpy.graphQLFetch.calls.mostRecent().args;
      expect(callArgs[1].variables.userName).toBeUndefined();
    });

    it('should return null when API returns null', (done) => {
      apolloSpy.graphQLFetch.and.returnValue(
        of({ data: { certificateUrl: null } })
      );

      service.getCertificateUrl(42).subscribe((url) => {
        expect(url).toBeNull();
        done();
      });
    });
  });

  describe('rebadgeOpenBadge()', () => {
    it('should POST to the rebadge endpoint with achievement_id and email', () => {
      requestSpy.post.and.returnValue(of({ success: true }));

      service.rebadgeOpenBadge(55, 'new@example.com').subscribe();

      expect(requestSpy.post).toHaveBeenCalledWith(
        jasmine.objectContaining({
          data: { achievement_id: 55, email: 'new@example.com' },
        })
      );
    });

    it('should include APIEndpoint in the endPoint', () => {
      requestSpy.post.and.returnValue(of({ success: true }));

      service.rebadgeOpenBadge(55, 'test@example.com').subscribe();

      const callArgs = requestSpy.post.calls.mostRecent().args[0];
      expect(callArgs.endPoint).toContain('motivations/achievement/rebadge');
    });

    it('should propagate the API response', (done) => {
      const mockResponse = { success: true, data: { id: 55 } };
      requestSpy.post.and.returnValue(of(mockResponse));

      service.rebadgeOpenBadge(55, 'test@example.com').subscribe((res) => {
        expect(res).toEqual(mockResponse);
        done();
      });
    });
  });
});
