import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { AuthService } from '@app/auth/auth.service';
import { BrowserStorageService } from '@app/services/storage.service';

import { SwitcherResolverService } from './switcher-resolver.service';

describe('SwitcherResolverService', () => {
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      {
        provide: AuthService,
        useValue: jasmine.createSpyObj('AuthService', [
          'getStacks'
        ])
      },
      {
        provide: BrowserStorageService,
        useValue: jasmine.createSpyObj('BrowserStorageService', [
          'stacks'
        ])
      }
    ]
  }));

  it('should be created', () => {
    const service: SwitcherResolverService = TestBed.inject(SwitcherResolverService);
    expect(service).toBeTruthy();
  });

  describe('resolve()', () => {
    let service: SwitcherResolverService;
    beforeEach(() => {
      service = TestBed.inject(SwitcherResolverService);
      storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    });

    it('should be return stacks from localStorage', fakeAsync(() => {
      service.resolve();
      flushMicrotasks();
      expect(storageSpy.stacks).toHaveBeenCalled();
    }));
  });
});
