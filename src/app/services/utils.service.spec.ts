import { TestBed,  } from '@angular/core/testing';
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
    it('should compare 2 timestamp strings', () => {
      const date = service.timeComparer('2019-08-06 15:03:00');
      console.log(date);
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
    it('should format time to accommodate safari\'s timestamp standard', () => {
      const result = service.timeStringFormatter('2019-08-06 15:03:00');
      expect(result).toEqual('2019-08-06T15:03:00Z');
    });
  });
});
