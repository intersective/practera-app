import { TestBed, flushMicrotasks } from '@angular/core/testing';
import { UtilsService } from './utils.service';
import * as _ from 'lodash';

describe('UtilsService', () => {
  let service: UtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UtilsService,
      ]
    });

    service = TestBed.get(UtilsService);
  });

  it('should created', () => {
    expect(service).toBeTruthy();
  });

  describe('lodash extensions', () => {
    it('should extend each()', () => {
      spyOn(_, 'each');
      service.each([1,2,3], () => true);
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

      spyOn(window, 'open')
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
  });

  describe('changeThemeColor()', () => {
    it('should access to window.document style properties and update value', () => {
      spyOn(service['document'].documentElement.style, 'setProperty');
      const COLOR = '#000000';
      service.changeThemeColor(COLOR);

      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith('--ion-color-primary', COLOR);
      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith('--ion-color-primary-shade', COLOR);
      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith('--ion-color-primary-tint', COLOR + '33');
      expect(service['document'].documentElement.style.setProperty).toHaveBeenCalledWith('--ion-color-primary-rgb', '0,0,0');
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

  describe('timeComparer()', () => {
    const earlier = new Date(Date.UTC(2020));

    /*it('should return -1 when compare earlier than now date', () => {
      const result = service.timeComparer(earlier, {});
      expect(result).toEqual(-1);
    });
*/
    it('should return 0 when compare with 1 same dates', () => {
      const date = new Date();
      const result = service.timeComparer(date, { comparedString: date});
      expect(result).toEqual(0);
    });

    it('should return 1 when compare with later with earlier date', () => {
      const now = new Date();
      const later = new Date(now.setFullYear(now.getFullYear() + 1));
      const result = service.timeComparer(later, { comparedString: earlier});
      expect(result).toEqual(1);
    });
  });

  const SAMPLE = [{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}];
  describe('getNextArrayElement()', () => {
    it('should return next element of an Array', () => {
      const result = service.getNextArrayElement(SAMPLE, 2);
      expect(result).toEqual(jasmine.objectContaining({id: 3}));
    });
  });

  describe('checkOrderById()', () => {
    it('should return true if target id is last element of an Array', () => {
      const result = service.checkOrderById(SAMPLE, 6, { isLast: true });
      expect(result).toBeTruthy();
    });
  });

  describe('timeStringFormatter()', () => {
    it('should format time to accommodate safari\'s timestamp standard (ISO 8601)', () => {
      const result = service.timeStringFormatter(new Date('2019-08-06 15:03:00 GMT+0000'));
      expect(result).toEqual('2019-08-06T15:03:00.000Z'); // ISO 8601
      expect(result).not.toEqual('2019-08-06T15:03:00Z');
    });
  });
});
