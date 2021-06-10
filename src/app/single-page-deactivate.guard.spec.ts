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
            get: false
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
      expect(guard.canDeactivate()).toBeTruthy();
    }));

    it('should be false if storage has singePageRestriction set as false', inject([SinglePageDeactivateGuard], (guard: SinglePageDeactivateGuard) => {
      storageSpy.get.and.returnValue(true);
      expect(guard.canDeactivate()).toBeFalsy();
    }));
  });
});
