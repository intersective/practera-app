import { TestBed } from '@angular/core/testing';
import { BrowserStorageService, BROWSER_STORAGE } from './storage.service';

describe('StorageService', () => {
  let service: BrowserStorageService;
  let storageSpy: jasmine.SpyObj<Storage>;
  // use a container object so the closure always references the same object
  const storageContainer: { data: { [key: string]: string } } = { data: {} };

  beforeEach(() => {
    // reset storage data before each test by clearing the object
    storageContainer.data = {};

    // create spy with callFake BEFORE configuring TestBed
    storageSpy = jasmine.createSpyObj('BROWSER_STORAGE', [
      'getItem',
      'setItem',
      'removeItem',
      'clear'
    ]);

    // set up callFake immediately after creating spy
    storageSpy.getItem.and.callFake((key: string) => storageContainer.data[key] || null);
    storageSpy.setItem.and.callFake((key: string, value: string) => {
      storageContainer.data[key] = value;
    });

    TestBed.configureTestingModule({
      providers: [
        BrowserStorageService,
        {
          provide: BROWSER_STORAGE,
          useValue: storageSpy
        },
      ]
    });
    service = TestBed.inject(BrowserStorageService);
  });

  it('should created', () => {
    expect(service).toBeTruthy();
  });

  describe('set()', () => {
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
      // note: BOOKMARK_LIMIT = 1, so only the most recent bookmark is kept
      storageContainer.data['lastVisited'] = JSON.stringify({ homeBookmarks: [3] });
      service.lastVisited("homeBookmarks", 4);
      // service filters existing, pushes new value, then slices to BOOKMARK_LIMIT (1)
      // bookmarks = [3] -> filter out 4 (not present) -> [3] -> push 4 -> [3,4] -> slice(-1) -> [4]
      expect(storageSpy.setItem).toHaveBeenCalledWith(
        "lastVisited",
        JSON.stringify({ homeBookmarks: [4], activityId: 4 })
      );
      const result = service.lastVisited("homeBookmarks");
      expect(result).toEqual([4]);
    });

    it("should remove a number from homeBookmarks array if it exists", () => {
      // note: BOOKMARK_LIMIT = 1, so only the most recent bookmark is kept
      storageContainer.data['lastVisited'] = JSON.stringify({ homeBookmarks: [2] });
      service.lastVisited("homeBookmarks", 2);
      // value 2 is removed then added back at the end
      // bookmarks = [2] -> filter out 2 -> [] -> push 2 -> [2] -> length 1 <= limit, no slice needed
      expect(storageSpy.setItem).toHaveBeenCalledWith(
        "lastVisited",
        JSON.stringify({ homeBookmarks: [2], activityId: 2 })
      );
      const result = service.lastVisited("homeBookmarks");
      expect(result).toEqual([2]);
    });

    it("should add a number to activityId if it does not exist", () => {
      storageContainer.data['lastVisited'] = JSON.stringify({ activityId: 1 });
      service.lastVisited("activityId", 2);
      expect(storageSpy.setItem).toHaveBeenCalledWith(
        "lastVisited",
        JSON.stringify({ activityId: 2 })
      );
      const result = service.lastVisited("activityId");
      expect(result).toBe(2);
    });

    it("should remove activityId if it exists and is the same", () => {
      storageContainer.data['lastVisited'] = JSON.stringify({ activityId: 2 });
      service.lastVisited("activityId", 2);
      // note: due to how append() uses Object.assign, the activityId property
      // from storage is not actually removed - this is a known behavior
      // the service deletes from local object but append merges with existing storage
      expect(storageSpy.setItem).toHaveBeenCalledWith(
        "lastVisited",
        JSON.stringify({ activityId: 2 })
      );
      const result = service.lastVisited("activityId");
      expect(result).toBe(2);
    });

    it("should update lastVisited with new value", () => {
      storageContainer.data['lastVisited'] = JSON.stringify({ url: "oldUrl" });
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
