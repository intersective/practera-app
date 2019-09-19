import { AuthService } from './auth.service';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';
import { TestUtils } from '@testing/utils';

fdescribe('AuthService', () => {
  let service: AuthService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  const testUtils = new TestUtils();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['delete', 'post'])
        },
      ]
    });
    service = TestBed.get(AuthService);
    requestSpy = TestBed.get(RequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


});

