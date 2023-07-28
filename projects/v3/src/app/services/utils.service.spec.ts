import { TestBed, flushMicrotasks, fakeAsync } from '@angular/core/testing';
import { UtilsService, ThemeColor } from './utils.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ApolloService } from '@v3/services/apollo.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { ModalController } from '@ionic/angular';

describe('UtilsService', () => {
  moment.updateLocale('en', {
    monthsShort: [
      // customised shortened month to accommodate Intl date format
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'
    ]
  });
  const thisMoment = moment();
  const NOW = new Date();
  const YESTERDAY = new Date(moment(NOW).subtract(1, 'day').toString());
  const TOMORROW = new Date(moment(NOW).add(1, 'day').toString());
  let service: UtilsService;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UtilsService,
        {
          provide: ApolloService,
          useValue: jasmine.createSpyObj('ApolloService', {
            'getClient': function () {
              return {
                clearStore: jasmine.createSpy('clearStore'),
                stop: jasmine.createSpy('stop'),
              };
            },
          }),
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['getUser', 'getReferrer', 'get'])
        },
        {
          provide: ModalController,
          useValue: jasmine.createSpyObj('ModalController', [
            'dismiss', 'create'
          ]),
        },
      ],
    });

    service = TestBed.inject(UtilsService);
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
  });

  it('should created', () => {
    expect(service).toBeTruthy();
  });

  describe('lodash extensions', () => {
    it('should extend each()', () => {
      spyOn(_, 'each');
      service.each([1, 2, 3], () => true);
      expect(_.each).toHaveBeenCalled();
    });

    it('should unset', () => {
      spyOn(_, 'unset');
      service.unset([1, 2, 3], () => true);
      expect(_.unset).toHaveBeenCalled();
    });

    it('should find', () => {
      spyOn(_, 'find');
      service.find([1, 2, 3], () => true);
      expect(_.find).toHaveBeenCalled();
    });

    it('should findIndex', () => {
      spyOn(_, 'findIndex');
      service.findIndex([1, 2, 3], () => true);
      expect(_.findIndex).toHaveBeenCalled();
    });

    it('should has', () => {
      spyOn(_, 'has');
      service.has([1, 2, 3], () => true);
      expect(_.has).toHaveBeenCalled();
    });

    it('should flatten', () => {
      spyOn(_, 'flatten');
      service.flatten([1, 2, 3]);
      expect(_.flatten).toHaveBeenCalled();
    });

    it('should indexOf', () => {
      spyOn(_, 'indexOf');
      service.indexOf([1, 2, 3], () => true);
      expect(_.indexOf).toHaveBeenCalled();
    });

    it('should remove', () => {
      spyOn(_, 'remove');
      service.remove([1, 2, 3], () => true);
      expect(_.remove).toHaveBeenCalled();
    });
  });

  describe('openUrl()', () => {
    it('should execute open link with Window.open()', () => {
      const url = 'test.com';

      spyOn(window, 'open');
      service.openUrl(url);

      expect(window.open).toHaveBeenCalledWith(url, '_self');
    });
  });

  describe('addOrRemove()', () => {
    it('should add value if not element isn\'t available in the provided array', () => {
      const result = service.addOrRemove([], 'new value');
      expect(result.toString()).toEqual('new value');
      expect(result[0]).toEqual('new value');
    });

    it('should remove value if not element is available in the provided array', () => {
      const result = service.addOrRemove(['new value'], 'new value');
      expect(result).toEqual([]);
      expect(result.length).toEqual(0);
      expect(result.length).not.toEqual(1);
    });

    it('should accept object and remove subject from it', () => {
      const result = service.addOrRemove<object>({
        subject1: 'new subject 1',
        subject2: 'new subject 2',
        subject3: 'new subject 3',
        subject4: 'new subject 4',
        subject5: 'new subject 5',
      }, 'new subject 3');

      expect(result).toEqual({
        subject1: 'new subject 1',
        subject2: 'new subject 2',
        subject4: 'new subject 4',
        subject5: 'new subject 5',
      });
    });


    it('should add value if the subject is not already available in the provided object', () => {
      const result = service.addOrRemove<object>({
        subject1: 'new subject 1',
        subject2: 'new subject 2',
        subject3: 'new subject 3',
      }, 'new subject 4');

      expect(result).toEqual({
        subject1: 'new subject 1',
        subject2: 'new subject 2',
        subject3: 'new subject 3',
        4: 'new subject 4',
      });
    });
  });

  describe('changeThemeColor()', () => {
    beforeEach(() => {
      spyOn(service['document'].documentElement.style, 'setProperty');
    });

    it('should access to window.document style properties and update value', () => {
      const COLOR = '#000000';
      service.changeThemeColor({
        primary: COLOR
      });

      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith('--ion-color-primary', COLOR);
      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith('--ion-color-primary-shade', COLOR);
      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith('--ion-color-primary-tint', COLOR + '33');
      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith('--ion-color-primary-rgb', '0, 0, 0');
    });

    it('should set default color when primary & theme are undefined', () => {
      const COLOR = '#2bbfd4'; // default color
      service.changeThemeColor({
        primary: undefined,
        theme: undefined,
      });

      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith('--ion-color-primary', COLOR);
      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith('--ion-color-primary-shade', COLOR);
      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith('--ion-color-primary-tint', COLOR + '33');
      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith('--ion-color-primary-rgb', '43, 191, 212');
    });

    it('should set theme (when available) color when primary is undefined', () => {
      const COLOR = '#111111';
      service.changeThemeColor({
        primary: undefined,
        theme: COLOR,
      });

      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith('--ion-color-primary', COLOR);
      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith('--ion-color-primary-shade', COLOR);
      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith('--ion-color-primary-tint', COLOR + '33');
      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith('--ion-color-primary-rgb', '17, 17, 17');
    });

    it('should set default color when no colors provided', () => {
      const COLOR = '#2bbfd4'; // default color
      service.changeThemeColor();

      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith('--ion-color-primary', COLOR);
      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith('--ion-color-primary-shade', COLOR);
      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith('--ion-color-primary-tint', COLOR + '33');
      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith('--ion-color-primary-rgb', '43, 191, 212');
    });

    it('should set secondary color', () => {
      const COLOR2 = '#000000';
      service.changeThemeColor({
        primary: undefined,
        theme: undefined,
        secondary: COLOR2,
      });

      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith(`--ion-color-${ThemeColor.secondary}`, COLOR2);
      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith(`--ion-color-${ThemeColor.secondary}-shade`, COLOR2);
      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith(`--ion-color-${ThemeColor.secondary}-tint`, COLOR2 + '33');
      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith(`--ion-color-${ThemeColor.secondary}-rgb`, '0, 0, 0');
    });
  });

  describe('changeCardBackgroundImage()', () => {
    it('should change background image by accessing to document style property', () => {
      spyOn(service['document'].documentElement.style, 'setProperty');
      const TEST_IMAGE = 'test-image.png';
      service.changeCardBackgroundImage(TEST_IMAGE);
      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith('--practera-card-background-image', `url('${TEST_IMAGE}')`);
    });
  });

  describe('getEvent()', () => {
    it('should listen event rxjs subject', () => {
      // service['_eventsSubject']
      const TEST_RES = 'test-event';
      const TEST_RES2 = 'test-event2';
      let result;
      service.getEvent('test').subscribe(res => {
        result = res;
      });

      service.broadcastEvent('test', TEST_RES);
      expect(result).toEqual(TEST_RES);

      service.broadcastEvent('test', TEST_RES2);
      expect(result).toEqual(TEST_RES2);

      service.broadcastEvent('test2', 'nothing happen');
      expect(result).not.toEqual('nothing happen');
    });
  });

  describe('isMobile()', () => {
    it('should return false when screensize > 576', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(577);
      const result = service.isMobile();
      expect(result).toBeFalsy();
    });

    it('should return false when screensize <= 576', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(576);
      const result = service.isMobile();
      expect(result).toBeTruthy();
    });
  });

  describe('isEmpty()', () => {
    it('should check if target parameter is empty (undefined, null, {}, \'\')', () => {
      expect(service.isEmpty('')).toBeTruthy();
      expect(service.isEmpty({})).toBeTruthy();
      expect(service.isEmpty(null)).toBeTruthy();
      expect(service.isEmpty(undefined)).toBeTruthy();
      expect(service.isEmpty(0)).toBeFalsy();
      expect(service.isEmpty(1)).toBeFalsy();
    });
  });

  // xdescribe('getActivityCache()', () => {
  //   it('should update cache for activitySubjects', () => {
  //     service.activitySubjects = {};
  //     service.getActivityCache('newCache');

  //     expect(service.activitySubjects['newCache']).toBeTruthy();
  //     expect(service.activitySubjects['newCache'] instanceof BehaviorSubject).toBeTruthy();
  //     expect(service.activitySubjects['notexist']).toBeFalsy();
  //   });
  // });

  // xdescribe('updateActivityCache()', () => {
  //   it('should update cache for activitySubjects', () => {
  //     service.activitySubjects = {};
  //     service.updateActivityCache('test', 'activity');

  //     expect(service.activitySubjects['test']).toBeTruthy();
  //     expect(service.activitySubjects['test'] instanceof BehaviorSubject).toBeTruthy();

  //     let result;
  //     service.activitySubjects['test'].subscribe(res => {
  //       result = res;
  //     });

  //     expect(result).toEqual('activity');

  //   });
  // });

  describe('clearCache()', () => {
    // xit('should trigger cache clearing through observables', () => {
    //   service.activitySubjects = [
    //     { next: jasmine.createSpy('next') },
    //     { next: jasmine.createSpy('next') },
    //     { next: jasmine.createSpy('next') },
    //   ];

    //   spyOn(service.projectSubject, 'next');
    //   service.clearCache();

    //   expect(service.projectSubject.next).toHaveBeenCalledWith(null);
    //   expect(service.activitySubjects[0].next).toHaveBeenCalledWith(null);
    //   expect(service.activitySubjects[1].next).toHaveBeenCalledWith(null);
    //   expect(service.activitySubjects[2].next).toHaveBeenCalledWith(null);
    // });

    it('should clear caches that covered in this function', fakeAsync(() => {
      service['apolloService'].getClient = jasmine.createSpy('getClient').and.returnValue({
        clearStore: jasmine.createSpy('clearStore').and.returnValue(Promise.resolve(true)),
        stop: jasmine.createSpy('clearStore'),
      });

      service.clearCache();
      flushMicrotasks();
      expect(service['apolloService'].getClient).toHaveBeenCalled();
      expect(service['apolloService'].getClient().clearStore).toHaveBeenCalled();
    }));
  });

  describe('urlQueryToObject()', () => {
    it('should turn url query into programmatically useable object', () => {
      const result = service.urlQueryToObject('this=is&a=test&object=value');
      expect(result).toEqual(jasmine.objectContaining({ this: 'is', a: 'test', object: 'value' }));
    });
  });

  describe('timeFormatter()', () => {
    const LOCAL_TIME_TODAY = [
      `${thisMoment.format('YYYY-MM-DD')} 00:00:00`,
      `${thisMoment.format('YYYY-MM-DD')} 01:00:00`,
      `${thisMoment.format('YYYY-MM-DD')} 02:00:00`,
      `${thisMoment.format('YYYY-MM-DD')} 03:00:00`,
      `${thisMoment.format('YYYY-MM-DD')} 04:00:00`,
      `${thisMoment.format('YYYY-MM-DD')} 05:00:00`,
      `${thisMoment.format('YYYY-MM-DD')} 06:00:00`,
      `${thisMoment.format('YYYY-MM-DD')} 07:00:00`,
      `${thisMoment.format('YYYY-MM-DD')} 08:00:00`,
      `${thisMoment.format('YYYY-MM-DD')} 09:00:00`,
      `${thisMoment.format('YYYY-MM-DD')} 10:00:00`,
      `${thisMoment.format('YYYY-MM-DD')} 11:00:00`,
      `${thisMoment.format('YYYY-MM-DD')} 12:00:00`,
      `${thisMoment.format('YYYY-MM-DD')} 13:00:00`,
      `${thisMoment.format('YYYY-MM-DD')} 14:00:00`,
      `${thisMoment.format('YYYY-MM-DD')} 15:00:00`,
      `${thisMoment.format('YYYY-MM-DD')} 16:00:00`,
      `${thisMoment.format('YYYY-MM-DD')} 17:00:00`,
      `${thisMoment.format('YYYY-MM-DD')} 18:00:00`,
      `${thisMoment.format('YYYY-MM-DD')} 19:00:00`,
      `${thisMoment.format('YYYY-MM-DD')} 20:00:00`,
      `${thisMoment.format('YYYY-MM-DD')} 21:00:00`,
      `${thisMoment.format('YYYY-MM-DD')} 22:00:00`,
      `${thisMoment.format('YYYY-MM-DD')} 23:00:00`,
    ];

    it('should return empty string if no time provided', () => {
      const result = service.timeFormatter('');
      expect(result).toEqual('');
    });

    it('should standardize date format', () => {
      const result = service.timeFormatter(NOW);
      const formatted = new Intl.DateTimeFormat('en-GB', {
        hour12: true,
        hour: 'numeric',
        minute: 'numeric'
      }).format(NOW);
      expect(result).toEqual(formatted);
    });

    it('should standardize date format international format', () => {
      const onePMUTC = `${thisMoment.format('YYYY-MM-DD')} 13:00:00.000Z`;
      const result = service.timeFormatter(onePMUTC); // follows local GMT
      const formatted = new Intl.DateTimeFormat('en-GB', {
        hour12: true,
        hour: 'numeric',
        minute: 'numeric'
      }).format(new Date(onePMUTC));
      expect(result).toEqual(formatted);
    });

    it('should ensure all numeric time format is return in expected time format (h:mm a)', () => {
      LOCAL_TIME_TODAY.forEach(timeString => {
        const result = service.timeFormatter(timeString);
        const formatted = new Intl.DateTimeFormat('en-GB', {
          hour12: true,
          hour: 'numeric',
          minute: 'numeric'
        }).format(new Date(`${timeString} GMT+0000`));

        if (result === 'Tomorrow') {
          expect(thisMoment.utcOffset()).toBeGreaterThan(0);
          expect(moment.utc(new Date(`${timeString} GMT+0000`)).isAfter(thisMoment.format('YYYY-MM-DD'))).toBeTruthy();
        } else if (result === 'Yesterday') {
          expect(thisMoment.utcOffset()).toBeLessThan(0);
          expect(moment.utc(new Date(`${timeString} GMT+0000`)).isBefore(thisMoment.format('YYYY-MM-DD'))).toBeTruthy();
        } else {
          expect(result).toEqual(formatted);
        }
      });
    });

    it('should see NOW as TOMORROW\'s yesterday', () => {
      const result = service.timeFormatter(NOW, TOMORROW);
      expect(result).toEqual('Yesterday'); // "NOW" is "TOMORROW"'s yesterday
    });

    it('should ignore date/month other than today', () => {
      const NEXT_MONTH = thisMoment.add(1, 'month').toString();
      const result = service.timeFormatter(NOW, new Date(NEXT_MONTH));
      expect(result).toEqual(moment(NOW).format('D MMM'));
    });

    it('should standardize today date into "Tomorrow"', () => {
      const result = service.timeFormatter(TOMORROW);
      expect(result).toEqual('Tomorrow');
    });

    it('should standardize today date into "Yesterday"', () => {
      const result = service.timeFormatter(YESTERDAY);
      expect(result).toEqual('Yesterday');
    });

    it('should standardize today date into formatted date', () => {
      const future30days = new Date(moment('2020-01-01').add(30, 'days').toString());
      const result = service.timeFormatter(future30days);
      expect(result).toEqual('31 Jan');
    });
  });

  describe('utcToLocal()', () => {
    const DATE_STRING = '2020-01-01 00:00:00 GMT+0000'; // UTC 2020-01-01 00:00:00
    const DATE_WITH_CURRENT_TIMEZONE = new Date(DATE_STRING); // Date with current timezone (non UTC)

    it('should return empty string if no time provided', () => {
      const result = service.utcToLocal('');
      expect(result).toEqual('');
    });

    it('should turn UTC date into locale time', () => {
      const result = service.utcToLocal(DATE_STRING);
      const timezone_removed_date = service.utcToLocal(DATE_WITH_CURRENT_TIMEZONE);
      expect(result).toEqual(timezone_removed_date);
    });

    it('should display date only', () => {
      const result = service.utcToLocal(DATE_STRING, 'date');
      expect(result).toEqual('1 Jan 2020');
    });

    it('should display time only', () => {
      const result = service.utcToLocal(DATE_STRING, 'time');
      const timezone_removed_time = service.utcToLocal(DATE_WITH_CURRENT_TIMEZONE, 'time');
      expect(result).toEqual(timezone_removed_time);
    });
  });

  describe('dateFormatter()', () => {
    it('should standardize date format', () => {
      const result = service.dateFormatter(NOW);
      expect(result).toEqual('Today');
    });

    it('should standardize today date into "Tomorrow"', () => {
      const result = service.dateFormatter(TOMORROW);
      expect(result).toEqual('Tomorrow');
    });

    it('should standardize today date into "Yesterday"', () => {
      const result = service.dateFormatter(YESTERDAY);
      expect(result).toEqual('Yesterday');
    });

    it('should standardize today date into formatted date', () => {
      const future30days = new Date(moment('2020-01-01').add(30, 'days').toString());
      const result = service.dateFormatter(future30days);
      expect(result).toEqual('31 Jan 2020');
    });
  });

  describe('timeComparer()', () => {
    const earlier = new Date(Date.UTC(2020, 0));

    it('should return 0 when compared dates are on same date as today (now)', () => {
      const result = service.timeComparer(new Date(), {
        compareDate: true
      });
      expect(result).toEqual(0);
    });

    it('should return -1 when compare earlier than now date', () => {
      const result = service.timeComparer(earlier);
      expect(result).toEqual(-1);
    });

    it('should return 0 when compare with 1 same dates', () => {
      const date = new Date();
      const result = service.timeComparer(date, { comparedString: date });
      expect(result).toEqual(0);
    });

    it('should return 1 when compare with later with earlier date', () => {
      const now = new Date();
      const later = new Date(now.setFullYear(now.getFullYear() + 1));
      const result = service.timeComparer(later, { comparedString: earlier });
      expect(result).toEqual(1);
    });
  });

  const SAMPLE = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }];
  describe('getNextArrayElement()', () => {
    it('should return next element of an Array', () => {
      const result = service.getNextArrayElement(SAMPLE, 2);
      expect(result).toEqual(jasmine.objectContaining({ id: 3 }));
    });
  });

  describe('checkOrderById()', () => {
    it('should return true if target id is last element of an Array', () => {
      const result = service.checkOrderById(SAMPLE, 6, { isLast: true });
      expect(result).toBeTruthy();
    });
  });

  describe('iso8601Formatter()', () => {
    const DATE_STRING = '2019-08-06 15:03:00 GMT+0000';
    it('should turn time into ISO 8601 standard', () => {
      const result = service.iso8601Formatter(new Date(DATE_STRING));
      expect(result).toEqual('2019-08-06T15:03:00.000Z'); // ISO 8601
      expect(result).not.toEqual('2019-08-06T15:03:00Z');
    });

    it('should format time string to ISO 8601 standard', () => {
      const result = service.iso8601Formatter(DATE_STRING);
      expect(result).toEqual('2019-08-06T15:03:00.000Z'); // ISO 8601
    });

    it('should turn "2010-01-01 00:00:00" into ISO8601', () => {
      const result = service.iso8601Formatter('2010-01-01 00:00:00');
      expect(result).toEqual('2010-01-01T00:00:00.000Z');
    });
  });

  describe('randomNumber()', () => {
    it('should generate random number', () => {
      const randomNumber = service.randomNumber();
      expect(randomNumber).not.toEqual(123456);
      expect(typeof randomNumber === 'number').toBeTruthy();
    });
  });

  describe('urlFormatter()', () => {
    it('should format any kind of api url', () => {
      const domains = [
        'test.practera.com',
        'http://test.practera.com',
        'https://test.practera.com',
        'test.practera.com/',
        'http://test.practera.com/',
        'https://test.practera.com/',
      ];
      const endpoints = ['login', '/login', 'login/', undefined];

      const expectDomains = [
        'https://test.practera.com/login',
        'https://test.practera.com',
        'http://test.practera.com/login',
        'http://test.practera.com'
      ];

      domains.forEach((domain, dIndex) => {
        endpoints.forEach((endpoint, eIndex) => {

          if ((domain.includes('https://')) || (!domain.includes('https://') && !domain.includes('http://'))) {
            if (eIndex === 3) {
              expect(service.urlFormatter(domain, endpoint)).toEqual(expectDomains[1]);
            } else {
              expect(service.urlFormatter(domain, endpoint)).toEqual(expectDomains[0]);
            }
          }

          if (domain.includes('http://')) {
            if (eIndex === 3) {
              expect(service.urlFormatter(domain, endpoint)).toEqual(expectDomains[3]);
            } else {
              expect(service.urlFormatter(domain, endpoint)).toEqual(expectDomains[2]);
            }
          }
        });
      });
    });
  });

  describe('getDateDifference()', () => {
    it('should return difference between two dates', () => {
      const difference = service.getDateDifference('2021-11-25 05:18:00', '2021-11-28 05:18:00');
      expect(difference).toEqual(3);
    });
  });

  describe('getFutureDated()', () => {
    it('should return future date from the date it get', () => {
      const date = service.getFutureDated('2021-11-25 05:18:00', 2);
      const momentObj = moment(service.iso8601Formatter('2021-11-25 05:18:00'));
      const expected = momentObj.clone().add(2, 'day').format('YYYY-MM-DD hh:mm:ss');
      expect(date).toEqual(expected);
    });
  });

  describe('getUserRolesForUI()', () => {
    it(`should return 'learner' for 'participant'`, () => {
      const role = service.getUserRolesForUI('participant');
      expect(role).toEqual('learner');
    });
    it(`should return 'expert' for 'mentor'`, () => {
      const role = service.getUserRolesForUI('mentor');
      expect(role).toEqual('expert');
    });
  });

  describe('moveToNewLocale()', () => {
    it('should change URL to one with proper locale', () => {
      const subject = {
        origin: 'https://sample.com',
        pathname: '/v3/home',
      };
      const targetLocale = 'sample-locale';

      service.getCurrentLocation = jasmine.createSpy('getCurrentLocation').and.returnValue(subject);
      service.getCurrentLocale = jasmine.createSpy('getCurrentLocale').and.returnValue('en-US');
      service.redirectToUrl = jasmine.createSpy('service.redirectToUrl');
      service.moveToNewLocale(targetLocale);

      expect(service.redirectToUrl).toHaveBeenCalledWith(`${subject.origin}/${targetLocale}${subject.pathname}`);
    });


    it('should change URL to one with proper locale', () => {
      const subject = {
        origin: 'https://sample.com',
        pathname: '/en-US/v3/home',
      };
      const targetLocale = 'new-locale';

      service.getCurrentLocation = jasmine.createSpy('getCurrentLocation').and.returnValue(subject);
      service.getCurrentLocale = jasmine.createSpy('getCurrentLocale').and.returnValue('en-US');
      service.redirectToUrl = jasmine.createSpy('service.redirectToUrl');
      service.moveToNewLocale(targetLocale);

      // expect(service.redirectToUrl).toHaveBeenCalledWith(`${subject.origin}/${targetLocale}${subject.pathname}`);
    });
  });

  describe('checkIsPracteraSupportEmail()', () => {

    const tempUser = {
      uuid: 'uuid-1',
      name: 'test user',
      firstName: 'test',
      lastName: 'user',
      email: 'test@abcd.com',
      image: 'https://swapnil2597.github.io/assets/img/profile.png',
      role: 'participent',
      contactNumber: '1212121212',
      userHash: '1234#asdwdd',
      institutionName: 'Test institute',
      teamName: 'team 1',
      experienceId: 1234
    }

    const tempPrograms = [
      {
        experience: {
          id: 1234,
          name: 'Global Trade Accelerator - 01',
          config: {
            primary_color: '#2bc1d9',
            secondary_color: '#9fc5e8',
            email_template: 'email_1',
            card_url: 'https://cdn.filestackcontent.com/uYxes8YBS2elXV0m2yjA',
            manual_url: 'https://www.filepicker.io/api/file/lNQp4sFcTjGj2ojOm1fR',
            design_url: 'https://www.filepicker.io/api/file/VuL71nOUSiM9NoNuEIhS',
            overview_url: 'https://vimeo.com/325554048'
          },
          lead_image: 'https://cdn.filestackcontent.com/urFIZW6TuC9lujp0N3PD',
          support_email: 'help@practera.com'
        }
      }
    ]

    it('"experienceId" and email matched should broadcast event with "true"', () => {
      spyOn(service, 'broadcastEvent');
      storageSpy.getUser.and.returnValue(tempUser);
      storageSpy.get.and.returnValue(tempPrograms);
      service.checkIsPracteraSupportEmail();
      expect(service.broadcastEvent).toHaveBeenCalledWith('support-email-checked', true);
    });

    it('"experienceId" matched and email not matched should broadcast event with "false"', () => {
      const program = tempPrograms;
      program[0].experience.support_email = 'asd@wer.com';
      spyOn(service, 'broadcastEvent');
      storageSpy.getUser.and.returnValue(tempUser);
      storageSpy.get.and.returnValue(program);
      service.checkIsPracteraSupportEmail();
      expect(service.broadcastEvent).toHaveBeenCalledWith('support-email-checked', false);
    });

    it('"experienceId" not matched should broadcast event with "false"', () => {
      const program = tempPrograms;
      program[0].experience.id = 54654;
      spyOn(service, 'broadcastEvent');
      storageSpy.getUser.and.returnValue(tempUser);
      storageSpy.get.and.returnValue(program);
      service.checkIsPracteraSupportEmail();
      expect(service.broadcastEvent).toHaveBeenCalledWith('support-email-checked', false);
    });

    it('"experienceId" or programs empty should return', () => {
      spyOn(service, 'broadcastEvent');
      storageSpy.getUser.and.returnValue(tempUser);
      service.checkIsPracteraSupportEmail();
      expect(service.broadcastEvent).not.toHaveBeenCalled();
    });
  });
});
