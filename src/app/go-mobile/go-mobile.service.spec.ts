import { TestBed } from '@angular/core/testing';
import { GoMobileService } from './go-mobile.service';
import { SharedModule } from '@shared/shared.module';
import { SharedService } from '@services/shared.service';
import { RouterModule, Router } from '@angular/router';
import {
  HttpClientTestingModule
} from '@angular/common/http/testing';

import { MockRouter } from '@testing/mocked.service';

describe('GoMobileService', () => {
  let service: GoMobileService;
  let sharedService: SharedService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ SharedModule, HttpClientTestingModule, RouterModule ],
      providers: [
        GoMobileService,
        {
          provide: SharedService,
          useValue: jasmine.createSpyObj('SharedService', ['updateProfile']),
        },
        {
          provide: Router,
          useClass: MockRouter
        }
      ],
    });

    service = TestBed.inject(GoMobileService);
    sharedService = TestBed.inject(SharedService);
  });

  it('should created', () => {
    expect(service).toBeTruthy();
  });

  describe('submit()', () => {
    it('should update profile through shareService.updateProfile', () => {
      const profile = {
        contact_number: '1234567890',
        email: 'test@email.com',
        sendsms: true,
      };

      spyOn(sharedService, 'updateProfile');
      service.submit(profile);
      expect(sharedService.updateProfile).toHaveBeenCalledWith(jasmine.objectContaining(profile));
    });
  });
});
