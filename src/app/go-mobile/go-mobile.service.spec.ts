import { TestBed } from '@angular/core/testing';
import { GoMobileService } from './go-mobile.service';

describe('GoMobileService', () => {
  let service: GoMobileService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GoMobileService,
      ],
    });

    service = TestBed.get(GoMobileService);
  });

  it('should created', () => {
    expect(service).toBeTruthy();
  });
});
