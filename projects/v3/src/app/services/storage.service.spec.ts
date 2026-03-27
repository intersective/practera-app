import { TestBed } from '@angular/core/testing';
import { BrowserStorageService, BROWSER_STORAGE } from './storage.service';

describe('StorageService', () => {
  let service: BrowserStorageService;
  let storageSpy; // : BROWSER_STORAGE;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BrowserStorageService,
        {
          provide: BROWSER_STORAGE,
          useValue: jasmine.createSpyObj('BROWSER_STORAGE', [
            'getItem',
            'setItem',
            'removeItem',
            'clear'
          ])
        },
      ]
    });
    service = TestBed.inject(BrowserStorageService);
    storageSpy = TestBed.inject(BROWSER_STORAGE);
  });

  it('should created', () => {
    expect(service).toBeTruthy();
  });

  xdescribe('set()', () => {
    it('should set value into cache', () => {
      service.set('test', 'value');
      expect(storageSpy.setItem).toHaveBeenCalled();
    });
  });

  describe('append()', () => {
    it('should append value into cached key', () => {
      const key = 'test';

      service.set(key, {'text': 'value1'});
      const result = service.append(key, {'text2': 'value2'});

      expect(storageSpy.getItem).toHaveBeenCalledWith(key);
      expect(storageSpy.setItem).toHaveBeenCalledTimes(2);
    });
  });

  describe('clear()', () => {
    it('should clear cache', () => {
      service.clear();
      expect(storageSpy.clear).toHaveBeenCalled();
    });
  });

  describe('getUser()', () => {
    it('should get user information ("me" item)', () => {
      service.getUser();
      expect(storageSpy.getItem).toHaveBeenCalledWith('me');
    });
  });

  describe('setUser()', () => {
    it('should set user information to ("me" item)', () => {
      service.getUser = jasmine.createSpy('getUser').and.returnValue({});

      service.setUser({ name: 'tester' });
      expect(storageSpy.setItem).toHaveBeenCalledWith('me', '{"name":"tester"}');
    });
  });

  describe('getReferrer()', () => {
    it('should get referrer information', () => {
      service.getReferrer();
      expect(storageSpy.getItem).toHaveBeenCalledWith('referrer');
    });
  });

  describe('setReferrer()', () => {
    it('should set referrer information', () => {
      service.getReferrer = jasmine.createSpy('getUser').and.returnValue({});

      service.setReferrer({ route: 'activity-task', url: 'tester' });
      expect(storageSpy.setItem).toHaveBeenCalledWith('referrer', '{"route":"activity-task","url":"tester"}');
    });
  });

  describe('getConfig()', () => {
    it('should retrieve cached config', () => {
      service.getConfig();
      expect(storageSpy.getItem).toHaveBeenCalledWith('config');
    });
  });

  describe('setConfig()', () => {
    it('should set configuration to ("config" item)', () => {
      service.getConfig = jasmine.createSpy('getConfig').and.returnValue({});

      service.setConfig({ logo: 'image' });
      expect(storageSpy.setItem).toHaveBeenCalledWith('config', '{"logo":"image"}');
    });
  });

  describe('setBookedEventActivityIds()', () => {
    it('should cache booked event & activity ids', () => {
      storageSpy.getItem = jasmine.createSpy('getItem').and.returnValue(JSON.stringify([1, 2, 3, 4, 5, 6]));
      service.setBookedEventActivityIds(7);
      expect(storageSpy.getItem).toHaveBeenCalledWith('bookedEventActivityIds');
      expect(storageSpy.setItem).toHaveBeenCalledWith('bookedEventActivityIds', '[1,2,3,4,5,6,7]');
    });
  });

  describe('removeBookedEventActivityIds()', () => {
    beforeEach(() => {
      storageSpy.getItem = jasmine.createSpy('getItem').and.returnValue(JSON.stringify([1, 2, 3, 4, 5, 6]));
    });

    it('should remove cached event & activity', () => {
      service.removeBookedEventActivityIds(2);
      expect(storageSpy.getItem).toHaveBeenCalledWith('bookedEventActivityIds');
      expect(storageSpy.setItem).toHaveBeenCalledWith('bookedEventActivityIds', '[1,3,4,5,6]');
    });
  });

  describe('initBookedEventActivityIds()', () => {
    it('should remove cache with key "bookedEventActivityIds"', () => {
      service.initBookedEventActivityIds();
      expect(storageSpy.removeItem).toHaveBeenCalledWith('bookedEventActivityIds');
    });
  });

  describe('singlePageAccess', () => {
    it('should be false if null or none cached', () => {
      storageSpy.getItem = jasmine.createSpy('getItem').and.returnValue(null);
      expect(service.singlePageAccess).toBeFalsy();
    });
    it('should be true if true cached under singlePageAccess', () => {
      storageSpy.getItem = jasmine.createSpy('getItem').and.returnValue(true);
      expect(service.singlePageAccess).toBeTruthy();
    });
  });

  describe("lastVisited()", () => {
    beforeEach(() => {
      storageSpy.getItem.and.returnValue(null);
    });

    it("should return null if no value is set", () => {
      const result = service.lastVisited("homeBookmarks");
      expect(result).toBeNull();
    });

    it("should set and return a string value", () => {
      service.lastVisited("url", "testUrl");
      expect(storageSpy.setItem).toHaveBeenCalledWith(
        "lastVisited",
        JSON.stringify({ url: "testUrl" })
      );
      const result = service.lastVisited("url");
      expect(result).toBe("testUrl");
    });

    it("should set and return a number value", () => {
      service.lastVisited("activityId", 123);
      expect(storageSpy.setItem).toHaveBeenCalledWith(
        "lastVisited",
        JSON.stringify({ activityId: 123 })
      );
      const result = service.lastVisited("activityId");
      expect(result).toBe(123);
    });

    it("should add a number to homeBookmarks array", () => {
      storageSpy.getItem.and.returnValue(
        JSON.stringify({ homeBookmarks: [1, 2, 3] })
      );
      service.lastVisited("homeBookmarks", 4);
      expect(storageSpy.setItem).toHaveBeenCalledWith(
        "lastVisited",
        JSON.stringify({ homeBookmarks: [1, 2, 3, 4] })
      );
      const result = service.lastVisited("homeBookmarks");
      expect(result).toEqual([1, 2, 3, 4]);
    });

    it("should remove a number from homeBookmarks array if it exists", () => {
      storageSpy.getItem.and.returnValue(
        JSON.stringify({ homeBookmarks: [1, 2, 3] })
      );
      service.lastVisited("homeBookmarks", 2);
      expect(storageSpy.setItem).toHaveBeenCalledWith(
        "lastVisited",
        JSON.stringify({ homeBookmarks: [1, 3] })
      );
      const result = service.lastVisited("homeBookmarks");
      expect(result).toEqual([1, 3]);
    });

    it("should add a number to activityId if it does not exist", () => {
      storageSpy.getItem.and.returnValue(JSON.stringify({ activityId: 1 }));
      service.lastVisited("activityId", 2);
      expect(storageSpy.setItem).toHaveBeenCalledWith(
        "lastVisited",
        JSON.stringify({ activityId: 2 })
      );
      const result = service.lastVisited("activityId");
      expect(result).toBe(2);
    });

    it("should remove activityId if it exists and is the same", () => {
      storageSpy.getItem.and.returnValue(JSON.stringify({ activityId: 2 }));
      service.lastVisited("activityId", 2);
      expect(storageSpy.setItem).toHaveBeenCalledWith(
        "lastVisited",
        JSON.stringify({})
      );
      const result = service.lastVisited("activityId");
      expect(result).toBeNull();
    });

    it("should update lastVisited with new value", () => {
      storageSpy.getItem.and.returnValue(JSON.stringify({ url: "oldUrl" }));
      service.lastVisited("url", "newUrl");
      expect(storageSpy.setItem).toHaveBeenCalledWith(
        "lastVisited",
        JSON.stringify({ url: "newUrl" })
      );
      const result = service.lastVisited("url");
      expect(result).toBe("newUrl");
    });
  });
});
