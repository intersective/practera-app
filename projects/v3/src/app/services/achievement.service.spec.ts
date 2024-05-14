import { TestBed } from '@angular/core/testing';
import { AchievementService } from './achievement.service';
import { of } from 'rxjs';
import { RequestService } from 'request';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { TestUtils } from '@testingv3/utils';

describe('AchievementService', () => {
  let service: AchievementService;
  let requestSpy: jasmine.SpyObj<RequestService>;

  beforeEach(() => {
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
      ]
    });
    service = TestBed.inject(AchievementService) as jasmine.SpyObj<AchievementService>;
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when testing getAchievements()', () => {
    const requestResponse = {
      success: true,
      data: [
        {
          id: 1,
          name: 'achieve 1',
          description: 'des',
          badge: '',
          points: 100,
          isEarned: true,
          earnedDate: '2019-02-02'
        },
        {
          id: 2,
          name: 'achieve 2',
          description: 'des',
          badge: '',
          points: 200,
          isEarned: false,
          earnedDate: '2019-02-02'
        },
        {
          id: 3,
          name: 'achieve 3',
          description: 'des',
          badge: '',
          points: 300,
          isEarned: true,
          earnedDate: '2019-02-02'
        },
        {
          id: 4,
          name: 'achieve 4',
          description: 'des',
          badge: '',
          points: 0,
          isEarned: true,
          earnedDate: '2019-02-02'
        }
      ]
    };
    const achievements = requestResponse.data[0];
    const expected = JSON.parse(JSON.stringify(requestResponse.data)).map(res => {
      return {
        id: res.id,
        name: res.name,
        description: res.description,
        image: res.badge,
        points: res.points,
        isEarned: res.isEarned,
        earnedDate: res.earnedDate
      };
    });

    describe('should throw error', () => {
      let tmpRes;
      let errMsg;
      beforeEach(() => {
        tmpRes = JSON.parse(JSON.stringify(requestResponse));
      });
      afterEach(() => {
        requestSpy.get.and.returnValue(of(tmpRes));
        service.getAchievements();
        service.achievements$.subscribe();
        expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
        expect(requestSpy.apiResponseFormatError.calls.first().args[0]).toEqual(errMsg);
      });
      it('Achievement format error', () => {
        tmpRes.data = {};
        errMsg = 'Achievement format error';
      });
      it('Achievement object format error', () => {
        tmpRes.data[0] = {};
        errMsg = 'Achievement object format error';
      });
    });

    it('should get the correct data', () => {
      requestSpy.get.and.returnValue(of(requestResponse));
      service.getAchievements();
      service.achievements$.subscribe(res => {
        expect(res).toEqual(expected);
      });
      expect(service.earnedPoints).toBe(400);
      expect(service.isPointsConfigured).toBe(true);
    });
  });
});
