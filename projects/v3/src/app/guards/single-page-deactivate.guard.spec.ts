import { TestBed, inject } from '@angular/core/testing';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UppyUploaderService } from '@v3/app/components/uppy-uploader/uppy-uploader.service';
import { SinglePageDeactivateGuard } from './single-page-deactivate.guard';

describe('SinglePageDeactivateGuard', () => {
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let uppySpy: jasmine.SpyObj<UppyUploaderService>;

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
        {
          provide: UppyUploaderService,
          useValue: {
            compressingUppy: null,
            cancelCompression: jasmine.createSpy('cancelCompression'),
          },
        },
      ],
    });
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    uppySpy = TestBed.inject(UppyUploaderService) as jasmine.SpyObj<UppyUploaderService>;
  });

  it('should be created', inject([SinglePageDeactivateGuard], (guard: SinglePageDeactivateGuard) => {
    expect(guard).toBeTruthy();
  }));

  describe('canDeactivate()', () => {
    it('should be false if storage has singePageAccess set as true', inject([SinglePageDeactivateGuard], async (guard: SinglePageDeactivateGuard) => {
      storageSpy.singlePageAccess = true;
      expect(await guard.canDeactivate()).toBeFalsy();
    }));

    it('should be able to deactivated if storage has singePageAccess is false/null', inject([SinglePageDeactivateGuard], async (guard: SinglePageDeactivateGuard) => {
      storageSpy.singlePageAccess = false;
      expect(await guard.canDeactivate()).toBeTruthy();

      storageSpy.singlePageAccess = null;
      expect(await guard.canDeactivate()).toBeTruthy();
    }));

    it('should prompt and cancel compression when user confirms leave', inject([SinglePageDeactivateGuard], async (guard: SinglePageDeactivateGuard) => {
      storageSpy.singlePageAccess = false;
      (uppySpy as any).compressingUppy = {} as any;
      spyOn(window, 'confirm').and.returnValue(true);

      const result = await guard.canDeactivate();

      expect(window.confirm).toHaveBeenCalled();
      expect(uppySpy.cancelCompression).toHaveBeenCalled();
      expect(result).toBeTrue();
    }));

    it('should prompt and block navigation when user cancels leave', inject([SinglePageDeactivateGuard], async (guard: SinglePageDeactivateGuard) => {
      storageSpy.singlePageAccess = false;
      (uppySpy as any).compressingUppy = {} as any;
      spyOn(window, 'confirm').and.returnValue(false);

      const result = await guard.canDeactivate();

      expect(window.confirm).toHaveBeenCalled();
      expect(uppySpy.cancelCompression).not.toHaveBeenCalled();
      expect(result).toBeFalse();
    }));
  });
});
