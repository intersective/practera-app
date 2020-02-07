import { async, ComponentFixture, TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { SwitcherService } from './switcher.service';
import { of, Observable, pipe } from 'rxjs';
import { RequestService } from '@shared/request/request.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { TestUtils } from '@testing/utils';
import { BrowserStorageServiceMock } from '@testing/mocked.service';
import { BrowserStorageService } from '@services/storage.service';
import { EventListService } from '@app/event-list/event-list.service';
import { ReviewListService } from '@app/review-list/review-list.service';
import { environment } from '@environments/environment';

describe('SwitcherService', () => {
    let service: SwitcherService;
    let requestSpy: jasmine.SpyObj<RequestService>;
    let notificationSpy: jasmine.SpyObj<NotificationService>;
    let storageSpy: jasmine.SpyObj<BrowserStorageService>;
    let eventSpy: jasmine.SpyObj<EventListService>;
    let reviewSpy: jasmine.SpyObj<ReviewListService>;
    let utils: UtilsService;
    const testUtils = new TestUtils();

    beforeEach(() => {
      TestBed.configureTestingModule({
          imports: [ HttpClientTestingModule ],
          providers: [
            SwitcherService,
            UtilsService,
            EventListService,
            ReviewListService,
            {
              provide: BrowserStorageService,
              useClass: BrowserStorageServiceMock
            },
            {
                provide: RequestService,
                useValue: jasmine.createSpyObj('RequestService', ['post', 'apiResponseFormatError'])
            },
            {
                provide: NotificationService,
                useValue: jasmine.createSpyObj('NotificationService', ['modal'])
            },
          ]
      });
      service = TestBed.get(SwitcherService);
      requestSpy = TestBed.get(RequestService);
      utils = TestBed.get(UtilsService);
      notificationSpy = TestBed.get(NotificationService);
      storageSpy = TestBed.get(BrowserStorageService);
      eventSpy = TestBed.get(EventListService);
      reviewSpy = TestBed.get(ReviewListService);

      requestSpy.get = jasmine.createSpy('get').and.returnValue(new Observable());
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getPrograms()', () => {
      it('should get program list from storage/cache', fakeAsync(() => {
        service.getPrograms().subscribe();
        flushMicrotasks();
        expect(storageSpy.get).toHaveBeenCalledWith('programs');
      }));
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
    });

    describe('when testing switchProgramAndNavigate()', () => {
        it('should return undefined if got empty ojbect ', fakeAsync(() => {
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
            service.switchProgramAndNavigate([{}, {}, {}]).then(data => {
              result = data;
            });
            flushMicrotasks();
            expect(result).toEqual(['switcher']);
        }));

        xit('should return [app, home] if programs is Array with multiple program objects ', fakeAsync(() => {
            spyOn(service, 'checkIsOneProgram').and.returnValue(true);
            spyOn(Array, 'isArray').and.returnValue(true);
            spyOn(service, 'switchProgram').and.returnValue(of({}));
            let result;
            service.switchProgramAndNavigate([{}]).then(data => {
              result = data;
            });
            flushMicrotasks();
            expect(result).toEqual(['app', 'home']);
        }));

        it('should return [app, home] if programs is not an Array and got one program object ', fakeAsync(() => {
            spyOn(utils, 'isEmpty').and.returnValue(false);
            spyOn(Array, 'isArray').and.returnValue(false);
            spyOn(service, 'switchProgram').and.returnValue(of({}));
            let result;
            service.switchProgramAndNavigate({}).then(data => {
              result = data;
            });
            flushMicrotasks();
            expect(result).toEqual(['app', 'home']);
        }));
    });

    describe('getTeamInfo()', () => {
      it('should make API request to `api/teams.json`', () => {
        service.getTeamInfo().subscribe(res => {
          expect(requestSpy.get).toHaveBeenCalledWith('api/teams.json');
        });
      });
    });

    describe('getMyInfo()', () => {
      it('should make API request to `api/users.json`', () => {
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
    })
});
