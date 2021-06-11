import { TestBed, async, inject } from '@angular/core/testing';
import { BrowserStorageService } from '@services/storage.service';
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
    it('should be true', inject([SinglePageDeactivateGuard], (guard: SinglePageDeactivateGuard) => {
      storageSpy.singlePageAccess = true;
      expect(guard.canDeactivate()).toBeTruthy();
    }));

    it('should be false if storage has singePageAccess set as false', inject([SinglePageDeactivateGuard], (guard: SinglePageDeactivateGuard) => {
      storageSpy.singlePageAccess = false;
      expect(guard.canDeactivate()).toBeFalsy();
    }));
  });
});
