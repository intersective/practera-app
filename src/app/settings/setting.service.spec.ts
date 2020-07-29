import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';
import { SettingService } from './setting.service';
import { SharedService } from '@services/shared.service';
import { Apollo } from 'apollo-angular';

describe('SettingService', () => {
  let service: SettingService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let sharedSpy: jasmine.SpyObj<SharedService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Apollo,
        SettingService,
        {
          provide: SharedService,
          useValue: jasmine.createSpyObj('SharedService', ['updateProfile'])
        },
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['post'])
        },
      ]
    });
    service = TestBed.inject(SettingService);
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
    sharedSpy = TestBed.inject(SharedService) as jasmine.SpyObj<SharedService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should upload profile', () => {
    sharedSpy.updateProfile.and.returnValue({});
    service.updateProfile({contact_number: '231'});
    expect(sharedSpy.updateProfile.calls.count()).toBe(1);
  });

  it('should update profile image #1', () => {
    requestSpy.post.and.returnValue(of({success: true, data: 'asdf'}));
    service.updateProfileImage({}).subscribe();
    expect(requestSpy.post.calls.count()).toBe(1);
  });

  it('should update profile image #2', () => {
    requestSpy.post.and.returnValue(of({success: false, data: 'asdf'}));
    service.updateProfileImage({}).subscribe();
    expect(requestSpy.post.calls.count()).toBe(1);
  });
});
