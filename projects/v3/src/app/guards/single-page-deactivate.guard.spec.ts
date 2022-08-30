import { TestBed, async, inject } from '@angular/core/testing';
import { BrowserStorageService } from '@v3/services/storage.service';
import { SinglePageDeactivateGuard } from './single-page-deactivate.guard';

describe('SinglePageDeactivateGuard', () => {
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SinglePageDeactivateGuard,
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            get: false,
            singlePageAccess: jasmine.createSpy('singlePageAccess')
          })
        },
      ],
    });
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
  });

  it('should be created', inject([SinglePageDeactivateGuard], (guard: SinglePageDeactivateGuard) => {
    expect(guard).toBeTruthy();
  }));

  describe('canDeactivate()', () => {
    it('should be false if storage has singePageAccess set as true', inject([SinglePageDeactivateGuard], (guard: SinglePageDeactivateGuard) => {
      storageSpy.singlePageAccess = true;
      expect(guard.canDeactivate()).toBeFalsy();
    }));

    it('should be able to deactivated if storage has singePageAccess is false/null', inject([SinglePageDeactivateGuard], (guard: SinglePageDeactivateGuard) => {
      storageSpy.singlePageAccess = false;
      expect(guard.canDeactivate()).toBeTruthy();

      storageSpy.singlePageAccess = null;
      expect(guard.canDeactivate()).toBeTruthy();
    }));
  });
});
