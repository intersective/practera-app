import { TestBed } from '@angular/core/testing';
import { RequestService } from '@shared/request/request.service';
import { of } from 'rxjs';

import { PreferenceService, APIs } from './preference.service';

describe('PreferenceService', () => {
  const TEST_DATA = 'testdata';
  let service: PreferenceService;
  let requestSpy: RequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', {
            post: of(TEST_DATA)
          })
        }
      ]
    });

    service = TestBed.inject(PreferenceService);
    requestSpy = TestBed.inject(RequestService);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPreference()', () => {
    it('should broadcast to _preferences$ observable', () => {
      service.getPreference();
      service['_preferences$'].subscribe(res => {
        expect(res).toBe(TEST_DATA);
      });
      expect(requestSpy.post).toHaveBeenCalledWith(APIs.preference, {});
    });
  });
});
