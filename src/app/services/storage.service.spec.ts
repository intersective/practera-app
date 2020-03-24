import { TestBed } from '@angular/core/testing';
import { BrowserStorageService, BROWSER_STORAGE } from './storage.service';

describe('StorageService', function() {
  let service: BrowserStorageService;
  let storage; // : BROWSER_STORAGE;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BrowserStorageService,
        {
          provide: BROWSER_STORAGE,
          useValue: jasmine.createSpyObj([
            'getItem',
            'setItem',
            'removeItem',
            'clear'
          ])
        },
      ]
    });
    service = TestBed.inject(BrowserStorageService);
    storage = TestBed.inject(BROWSER_STORAGE);
  });

  it('should created', () => {
    expect(service).toBeTruthy();
  });

  describe('set()', function() {
    it('should set value into cache', () => {
      service.set('test', 'value');
      expect(storage.setItem).toHaveBeenCalled();
    });
  });

  describe('append()', function() {
    it('should append value into cached key', () => {
      const key = 'test';

      service.set(key, {'text': 'value1'});
      const result = service.append(key, {'text2': 'value2'});

      expect(storage.getItem).toHaveBeenCalledWith(key);
      expect(storage.setItem).toHaveBeenCalledTimes(2);
    });
  });

  describe('clear()', function() {
    it('should clear cache', () => {
      service.clear();
      expect(storage.clear).toHaveBeenCalled();
    });
  });

  describe('getUser()', function() {
    it('should get user information ("me" item)', () => {
      service.getUser();
      expect(storage.getItem).toHaveBeenCalledWith('me');
    });
  });

  describe('setUser()', function() {
    it('should set user information to ("me" item)', () => {
      service.getUser = jasmine.createSpy('getUser').and.returnValue({});

      service.setUser({ name: 'tester' });
      expect(storage.setItem).toHaveBeenCalledWith('me', '{"name":"tester"}');
    });
  });

  describe('getConfig()', function() {
    it('should retrieve cached config', () => {
      service.getConfig();
      expect(storage.getItem).toHaveBeenCalledWith('config');
    });
  });

  describe('setConfig()', function() {
    it('should set configuration to ("config" item)', () => {
      service.getConfig = jasmine.createSpy('getConfig').and.returnValue({});

      service.setConfig({ logo: 'image' });
      expect(storage.setItem).toHaveBeenCalledWith('config', '{"logo":"image"}');
    });
  });

  describe('setBookedEventActivityIds()', function() {
    it('should cache booked event & activity ids', () => {
      storage.getItem = jasmine.createSpy('getItem').and.returnValue(JSON.stringify([1, 2, 3, 4, 5, 6]));
      service.setBookedEventActivityIds(7);
      expect(storage.getItem).toHaveBeenCalledWith('bookedEventActivityIds');
      expect(storage.setItem).toHaveBeenCalledWith('bookedEventActivityIds', '[1,2,3,4,5,6,7]');
    });
  });

  describe('removeBookedEventActivityIds()', function() {
    beforeEach(() => {
      storage.getItem = jasmine.createSpy('getItem').and.returnValue(JSON.stringify([1, 2, 3, 4, 5, 6]));
    });

    it('should remove cached event & activity', () => {
      service.removeBookedEventActivityIds(2);
      expect(storage.getItem).toHaveBeenCalledWith('bookedEventActivityIds');
      expect(storage.setItem).toHaveBeenCalledWith('bookedEventActivityIds', '[1,3,4,5,6]');
    });
  });

  describe('initBookedEventActivityIds()', function() {
    it('should remove cache with key "bookedEventActivityIds"', () => {
      service.initBookedEventActivityIds();
      expect(storage.removeItem).toHaveBeenCalledWith('bookedEventActivityIds');
    });
  });
});
