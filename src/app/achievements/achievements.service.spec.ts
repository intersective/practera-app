import { TestBed } from '@angular/core/testing';
import { AchievementsService } from './achievements.service';
import { of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';
import { BrowserStorageService } from '@services/storage.service';
import { Apollo } from 'apollo-angular';

describe('AchievementsService', () => {
  let service: AchievementsService;
  let requestSpy: jasmine.SpyObj<RequestService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Apollo,
        AchievementsService,
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
    service = TestBed.inject(AchievementsService) as jasmine.SpyObj<AchievementsService>;
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
          points: null,
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
        service.getAchievements().subscribe();
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
      service.getAchievements().subscribe(res => expect(res).toEqual(expected));
      expect(service.totalPoints).toBe(600);
      expect(service.earnedPoints).toBe(400);
      expect(service.isPointsConfigured).toBe(true);
    });
  });

  it('should get the correct earned points', () => {
    service.earnedPoints = 123;
    expect(service.getEarnedPoints()).toBe(123);
  });

  it('should get the correct total points', () => {
    service.totalPoints = 123;
    expect(service.getTotalPoints()).toBe(123);
  });

  it(`should get the correct 'is point configured'`, () => {
    service.isPointsConfigured = true;
    expect(service.getIsPointsConfigured()).toBe(true);
  });

  it(`should post the correct data when marking achievement as seen`, () => {
    requestSpy.post.and.returnValue(of({}));
    service.markAchievementAsSeen(11);
    expect(requestSpy.post.calls.count()).toBe(1);
    expect(requestSpy.post.calls.first().args[1]).toEqual({
      project_id: 1,
      identifier: 'Achievement-11',
      is_done: true
    });
  });

});
